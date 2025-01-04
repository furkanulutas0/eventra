import { NextFunction, Request, Response } from "express";
import { supabase } from "../../utils/supabase";

const generateRandomString = (length: number) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

async function generateEventId(creator_id: string) {
  const { data: creatorData, error: creatorError } = await supabase
    .from("users")
    .select("uuid")
    .eq("uuid", creator_id);
  if (creatorError) throw creatorError;
  if (creatorData.length === 0) throw new Error("Creator not found");
  const getUserIdPattern = creatorData[0].uuid.split("-")[0];
  const newId = `eventra-${getUserIdPattern}-${generateRandomString(5)}`;
  return newId;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DateTimeSlot {
  date: Date;
  timeSlots: TimeSlot[];
}

interface EventRequest {
  type: '1:1' | 'group';
  name: string;
  detail: string;
  location: string;
  dateTimeSlots: DateTimeSlot[];
  creator_id: string;
}

export class EventController {
  public async addEvent(req: Request, res: Response, next: NextFunction) {
    const eventData: EventRequest = req.body;
    const eventId = await generateEventId(eventData.creator_id);

    try {
      // Start a Supabase transaction
      const { data: event, error: eventError } = await supabase.from("events").insert({
        id: eventId,
        creator_id: eventData.creator_id,
        type: eventData.type,
        name: eventData.name,
        detail: eventData.detail,
        location: eventData.location,
        status: 'pending'
      }).select().single();

      if (eventError) throw eventError;

      // Insert dates and their time slots
      for (const dateSlot of eventData.dateTimeSlots) {
        const { data: eventDate, error: dateError } = await supabase
          .from("event_dates")
          .insert({
            event_id: eventId,
            date: dateSlot.date
          })
          .select()
          .single();

        if (dateError) throw dateError;

        // Insert time slots for this date
        const timeSlotInserts = dateSlot.timeSlots.map(slot => ({
          event_date_id: eventDate.id,
          start_time: slot.startTime,
          end_time: slot.endTime
        }));

        const { error: timeSlotError } = await supabase
          .from("event_time_slots")
          .insert(timeSlotInserts);

        if (timeSlotError) throw timeSlotError;
      }

      res.status(201).json({
        message: "Event created successfully",
        data: { eventId }
      });
    } catch (error) {
      next(res.status(400).json({ error }));
    }
  }

  public async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { event_id } = req.query;
      const { data, error } = await supabase.from("events").select("*, event_dates (*,event_time_slots(*)), event_schedule (*), event_participants (*)").eq("id", event_id);
      if (error) throw error;
      res.status(200).json({ data });
    } catch (error) {
      next(res.status(404).json({ error }));
    }
  }

  public async getEventByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { creator_id } = req.query;
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("creator_id", creator_id);
      if (error) throw error;
      res.status(200).json({ data });
    } catch (error) {
      next(res.status(404).json({ error }));
    }
  }

  public async updateEventStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { event_id, status } = req.body;

      const { data, error } = await supabase
        .from("events")
        .update({ status })
        .eq("id", event_id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({
        message: "Event status updated successfully",
        data
      });
    } catch (error) {
      next(res.status(400).json({ error }));
    }
  }

  public async submitAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, isAnonymous, eventId, timeSlotIds, votes } = req.body;

      // First check/create user
      let userId: string;
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("uuid")
        .eq("email", email)
        .single();

      if (!existingUser) {
        // Create new user with minimal info
        const { data: newUser, error: createUserError } = await supabase
          .from("users")
          .insert({
            email,
            name: name || email.split('@')[0], // Use name if provided, otherwise use email prefix
            password: generateRandomString(12), // Generate random password for non-registered users
            is_active: false // Mark as inactive since they haven't registered
          })
          .select("uuid")
          .single();

        if (createUserError) throw createUserError;
        userId = newUser.uuid;
      } else {
        userId = existingUser.uuid;
      }

      // Create event vote record
      const { error: voteError } = await supabase
        .from("event_votes")
        .insert({
          event_id: eventId,
          voter_email: email,
          is_anonymous: isAnonymous,
        });

      if (voteError) throw voteError;

      // Check if participant exists
      const { data: existingParticipant, error: existingError } = await supabase
        .from("event_participants")
        .select("id")
        .match({ event_id: eventId, user_id: userId })
        .single();

      let participantId;

      if (existingParticipant) {
        participantId = existingParticipant.id;
        
        // Delete existing availability entries
        const { error: deleteError } = await supabase
          .from("participant_availability")
          .delete()
          .eq("participant_id", participantId);

        if (deleteError) throw deleteError;
      } else {
        // Create new participant with user_id
        const { data: newParticipant, error: participantError } = await supabase
          .from("event_participants")
          .insert({
            event_id: eventId,
            user_id: userId,
            email,
            is_anonymous: isAnonymous,
            status: 'pending'
          })
          .select("id")
          .single();

        if (participantError) throw participantError;
        participantId = newParticipant.id;
      }

      // Insert availability and votes
      const availabilityData = timeSlotIds.map((timeSlotId: string) => ({
        participant_id: participantId,
        time_slot_id: timeSlotId,
        vote: votes[timeSlotId] || false
      }));

      const { error: availabilityError } = await supabase
        .from("participant_availability")
        .insert(availabilityData);

      if (availabilityError) throw availabilityError;

      res.status(201).json({
        message: "Availability submitted successfully",
        data: { participantId }
      });
    } catch (error) {
      next(res.status(400).json({ error }));
    }
  }
}
