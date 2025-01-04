import axios from "axios";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DateTimeSlot {
  date: Date;
  timeSlots: TimeSlot[];
}

interface CreateEventRequest {
  type: '1:1' | 'group' | null;
  name: string;
  detail: string;
  location: string;
  dateTimeSlots: DateTimeSlot[];
  creator_id: string;
}

interface ParticipantAvailability {
  name: string;
  email: string;
  isAnonymous: boolean;
  eventId: string;
  timeSlotIds: string[];
  votes: Record<string, boolean>;
}

export async function createEvent(eventData: CreateEventRequest) {
  try {
    const response = await axios.post('/api/event/createEvent', eventData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create event.");
  }
}

export async function getEventsByUser(creator_id: string) {
  try {
    const response = await axios.get(`/api/event/getEventsByUser?creator_id=${creator_id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch events.");
  }
}

export async function getEvent(event_id: string) {
  try {
    const response = await axios.get(`/api/event/getEventDataById?event_id=${event_id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch event.");
  }
}

export async function updateEventStatus(eventId: string, status: string) {
  try {
    const response = await axios.patch(`/api/event/updateStatus`, {
      event_id: eventId,
      status
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update event status.");
  }
}

export async function submitParticipantAvailability(data: ParticipantAvailability) {
  try {
    const response = await axios.post('/api/event/submitAvailability', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to submit availability.");
  }
}
