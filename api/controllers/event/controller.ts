import { format } from 'date-fns';
import { NextFunction, Request, Response, } from "express";
import { EmailService } from '../../services/email.service';
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
  isAnonymousAllowed: boolean;
  can_multiple_vote: boolean;
  creator_id: string;
}

interface EventDate {
  date: string;
  event_time_slots: Array<{
    id: string;
    start_time: string;
    end_time: string;
  }>;
}

interface TimeSlotWithId {
  id: string;
  start_time: string; 
  end_time: string;
}

interface SelectedTimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export class EventController {
  public async addEvent(req: Request, res: Response, next: NextFunction) {
    const eventData: EventRequest = req.body;
    const eventId = await generateEventId(eventData.creator_id);

    try {
      // Generate a unique share URL
      const shareUrl = `${process.env.FRONTEND_URL}/event/share/${eventId}`;

      // Start a Supabase transaction
      const { data: event, error: eventError } = await supabase.from("events").insert({
        id: eventId,
        creator_id: eventData.creator_id,
        type: eventData.type,
        name: eventData.name,
        detail: eventData.detail,
        location: eventData.location,
        status: 'pending',
        share_url: shareUrl,
        is_anonymous_allowed: eventData.isAnonymousAllowed,
        can_multiple_vote: eventData.can_multiple_vote
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
        data: { eventId, shareUrl }
      });
    } catch (error) {
      next(res.status(400).json({ error }));
    }
  }

  public async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { event_id } = req.query;
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          event_dates (
            *,
            event_time_slots (*)
          ),
          event_schedule (*),
          event_participants (
            id,
            event_id,
            user_id,
            status,
            is_anonymous,
            participant_name,
            participant_email,
            user:users (
              name,
              email
            ),
            participant_availability (
              id,
              time_slot_id,
              vote
            )
          ),
          event_votes (*)
        `)
        .eq("id", event_id)
        .single();

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
        .select(`*, event_participants (id)`)
        .eq("creator_id", creator_id)
        .eq("deleted", false);

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
      const { name, email, isAnonymous, eventId, timeSlotIds } = req.body;

      // First, check if event exists and get its type
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(`
          *,
          event_dates (
            date,
            event_time_slots (
              id,
              start_time,
              end_time
            )
          ),
          event_participants (
            participant_availability (
              time_slot_id,
              vote
            )
          )
        `)
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      // For 1:1 events, check if selected time slots are already taken
      if (eventData.type === "1:1") {
        // Get all voted time slots for this event
        const votedSlots = eventData.event_participants
          .flatMap((p: { participant_availability: { time_slot_id: string, vote: boolean }[] }) => p.participant_availability)
          .filter((a: { time_slot_id: string, vote: boolean }) => a.vote)
          .map((a: { time_slot_id: string, vote: boolean }) => a.time_slot_id);

        // Check if any of the selected slots are already taken
        const conflictingSlots = timeSlotIds.filter((id: string) => votedSlots.includes(id));

        if (conflictingSlots.length > 0) {
          res.status(400).json({
            status: "error",
            message: "One or more selected time slots are already taken"
          });
          return;
        }
      }

      // Check if event exists and is not completed
      if (eventData.status === "completed") {
        res.status(403).json({
          status: "error",
          message: "This poll has ended and is no longer accepting responses"
        });
        return;
      }

      // Check if this email has already participated in this event
      const { data: existingParticipant, error: checkError } = await supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", eventId)
        .eq("participant_email", email)
        .single();

      if (existingParticipant && !existingParticipant.is_anonymous) {
        res.status(200).json({
          status: "duplicate",
          message: "Email already exists",
          data: {
            participantId: existingParticipant.id,
            existingName: existingParticipant.participant_name,
            existingEmail: existingParticipant.participant_email
          }
        });
        return;
      }

      // Check if the user is registered in the system
      const { data: registeredUser, error: userError } = await supabase
        .from("users")
        .select("uuid, name")
        .eq("email", email)
        .single();

      if (userError) {
        // Handle error or create a temporary user entry if needed
        console.error("Error fetching user:", userError);
      }

      // Create participant entry
      const { data: participant, error: participantError } = await supabase
        .from("event_participants")
        .insert({
          event_id: eventId,
          user_id: registeredUser?.uuid || null, // Set to null if user is not registered
          participant_name: isAnonymous ? 'Anonymous' : (registeredUser?.name || name),
          participant_email: isAnonymous ? null : email,
          is_anonymous: isAnonymous,
          status: 'pending'
        })
        .select()
        .single();

      if (participantError) throw participantError;

      // Insert availability entries
      const availabilityData = timeSlotIds.map((timeSlotId: string) => ({
        participant_id: participant.id,
        time_slot_id: timeSlotId,
        vote: true
      }));

      const { error: availabilityError } = await supabase
        .from("participant_availability")
        .insert(availabilityData);

      if (availabilityError) throw availabilityError;

      // After successfully submitting availability, send confirmation email
      const selectedTimeSlots = eventData.event_dates
        .flatMap((date: EventDate) => date.event_time_slots
          .filter((slot: TimeSlotWithId) => timeSlotIds.includes(slot.id))
          .map((slot: TimeSlotWithId) => ({
            date: date.date,
            startTime: slot.start_time,
            endTime: slot.end_time
          }))
        );

      const formattedDateTime = selectedTimeSlots
        .map((slot: SelectedTimeSlot) => 
          `${format(new Date(slot.date), 'MMMM d, yyyy')} at ${slot.startTime.slice(0, 5)} - ${slot.endTime.slice(0, 5)}`
        )
        .join('\n');

      if (email) {
        await EmailService.sendVoteConfirmation(
          email,
          isAnonymous ? 'Anonymous' : name,
          eventData.name,
          formattedDateTime
        );
      }

      res.status(200).json({ message: "Availability submitted successfully" });
    } catch (error: any) {
      next(res.status(400).json({ error: error.message }));
    }
  }

  public async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { event_id } = req.params;

      // Soft delete the event by setting the deleted flag
      const { error } = await supabase
        .from("events")
        .update({ deleted: true })
        .eq("id", event_id);

      if (error) throw error;

      res.status(200).json({ message: "Event marked as deleted successfully" });
    } catch (error: any) {
      next(res.status(400).json({ error: error.message }));
    }
  }

  public async deleteParticipantAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, eventId } = req.body;

      // Find the participant by email and event ID
      const { data: participant, error: findError } = await supabase
        .from("event_participants")
        .select("id")
        .eq("participant_email", email)
        .eq("event_id", eventId)
        .single();

      if (findError || !participant) {
        res.status(404).json({ message: "Participant not found" });
        return
      }

      // Delete the participant's availability
      const { error: deleteError } = await supabase
        .from("participant_availability")
        .delete()
        .eq("participant_id", participant?.id);

      if (deleteError) throw deleteError;

      const { error: deleteEventEror } = await supabase
        .from("event_participants")
        .delete()
        .eq("id", participant?.id);

      if (deleteEventEror) throw deleteEventEror;

      res.status(200).json({ message: "Participant availability deleted successfully" });
    } catch (error: any) {
      next(res.status(400).json({ error: error.message }));
    }
  }
}
