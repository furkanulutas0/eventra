import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import type { Mock } from 'vitest';
import { 
  createEvent, 
  getEventsByUser, 
  getEvent, 
  updateEventStatus,
  submitParticipantAvailability,
  deleteEvent,
  deleteParticipantAvailability
} from '../../api/event.api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as unknown as {
  get: Mock;
  post: Mock;
  put: Mock;
  patch: Mock;
  delete: Mock;
};

describe('Event API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      // Mock request data
      const eventData = {
        type: '1:1' as '1:1',
        name: 'Test Event',
        detail: 'Test event details',
        location: 'Test location',
        dateTimeSlots: [
          {
            date: new Date('2023-06-15'),
            timeSlots: [
              { startTime: '10:00', endTime: '11:00' }
            ]
          }
        ],
        creator_id: 'test-creator-id',
        is_anonymous_allowed: true
      };

      // Mock response
      const mockResponse = {
        data: {
          message: 'Event created successfully',
          data: {
            eventId: 'eventra-test-123',
            shareUrl: 'http://localhost:3000/event/share/eventra-test-123'
          }
        }
      };

      // Setup axios mock
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Execute the API call
      const result = await createEvent(eventData);

      // Assertions
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/event/createEvent', eventData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when creating an event', async () => {
      // Mock request data
      const eventData = {
        type: '1:1' as '1:1',
        name: 'Test Event',
        detail: 'Test event details',
        location: 'Test location',
        dateTimeSlots: [
          {
            date: new Date('2023-06-15'),
            timeSlots: [
              { startTime: '10:00', endTime: '11:00' }
            ]
          }
        ],
        creator_id: 'test-creator-id',
        is_anonymous_allowed: true
      };

      // Mock error response
      const mockErrorResponse = {
        response: {
          data: {
            message: 'Failed to create event'
          }
        }
      };

      // Setup axios mock to throw error
      mockedAxios.post.mockRejectedValueOnce(mockErrorResponse);

      // Execute and assert
      await expect(createEvent(eventData)).rejects.toThrow('Failed to create event');
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/event/createEvent', eventData);
    });
  });

  describe('getEventsByUser', () => {
    it('should fetch events by user successfully', async () => {
      // Mock response
      const mockResponse = {
        data: {
          data: [
            {
              id: 'event-1',
              name: 'Event 1',
              type: '1:1'
            },
            {
              id: 'event-2',
              name: 'Event 2',
              type: 'group'
            }
          ]
        }
      };

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // Execute the API call
      const result = await getEventsByUser('test-user-id');

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/event/getEventsByUser?creator_id=test-user-id');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when fetching events by user', async () => {
      // Setup axios mock to throw error
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      // Execute and assert
      await expect(getEventsByUser('test-user-id')).rejects.toThrow('Failed to fetch events.');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/event/getEventsByUser?creator_id=test-user-id');
    });
  });

  describe('getEvent', () => {
    it('should fetch an event successfully', async () => {
      // Mock response
      const mockResponse = {
        data: {
          data: {
            id: 'test-event-id',
            name: 'Test Event',
            type: '1:1',
            creator_id: 'test-creator-id'
          }
        }
      };

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // Execute the API call
      const result = await getEvent('test-event-id');

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/event/getEventDataById?event_id=test-event-id');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when fetching an event', async () => {
      // Setup axios mock to throw error
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      // Execute and assert
      await expect(getEvent('test-event-id')).rejects.toThrow('Failed to fetch event.');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/event/getEventDataById?event_id=test-event-id');
    });
  });

  describe('updateEventStatus', () => {
    it('should update event status successfully', async () => {
      // Mock response
      const mockResponse = {
        data: {
          message: 'Event status updated successfully',
          data: {
            id: 'test-event-id',
            status: 'completed'
          }
        }
      };

      // Setup axios mock
      mockedAxios.patch.mockResolvedValueOnce(mockResponse);

      // Execute the API call
      const result = await updateEventStatus('test-event-id', 'completed');

      // Assertions
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/event/updateStatus', {
        event_id: 'test-event-id',
        status: 'completed'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when updating event status', async () => {
      // Setup axios mock to throw error
      mockedAxios.patch.mockRejectedValueOnce(new Error('Network error'));

      // Execute and assert
      await expect(updateEventStatus('test-event-id', 'completed')).rejects.toThrow('Failed to update event status.');
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/event/updateStatus', {
        event_id: 'test-event-id',
        status: 'completed'
      });
    });
  });

  describe('submitParticipantAvailability', () => {
    it('should submit participant availability successfully', async () => {
      // Mock request data
      const availabilityData = {
        name: 'Test User',
        email: 'test@example.com',
        isAnonymous: false,
        eventId: 'test-event-id',
        timeSlotIds: ['1', '2'],
        votes: { '1': true, '2': true }
      };

      // Mock response
      const mockResponse = {
        data: {
          message: 'Availability submitted successfully'
        }
      };

      // Setup axios mock
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Execute the API call
      const result = await submitParticipantAvailability(availabilityData);

      // Assertions
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/event/submitAvailability', availabilityData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when submitting availability', async () => {
      // Mock request data
      const availabilityData = {
        name: 'Test User',
        email: 'test@example.com',
        isAnonymous: false,
        eventId: 'test-event-id',
        timeSlotIds: ['1', '2'],
        votes: { '1': true, '2': true }
      };

      // Setup axios mock to throw error
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      // Execute and assert
      await expect(submitParticipantAvailability(availabilityData)).rejects.toThrow('Failed to submit availability.');
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/event/submitAvailability', availabilityData);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event successfully', async () => {
      // Mock response
      const mockResponse = {
        data: {
          message: 'Event marked as deleted successfully'
        }
      };

      // Setup axios mock
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      // Execute the API call
      const result = await deleteEvent('test-event-id');

      // Assertions
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/event/deleteEvent/test-event-id');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when deleting an event', async () => {
      // Setup axios mock to throw error
      mockedAxios.delete.mockRejectedValueOnce(new Error('Network error'));

      // Execute and assert
      await expect(deleteEvent('test-event-id')).rejects.toThrow('Failed to delete event.');
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/event/deleteEvent/test-event-id');
    });
  });

  describe('deleteParticipantAvailability', () => {
    it('should delete participant availability successfully', async () => {
      // Mock response
      const mockResponse = {
        data: {
          message: 'Participant availability deleted successfully'
        }
      };

      // Setup axios mock
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      // Execute the API call
      const result = await deleteParticipantAvailability('test@example.com', 'test-event-id');

      // Assertions
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/event/deleteParticipantAvailability', {
        data: {
          email: 'test@example.com',
          eventId: 'test-event-id'
        }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when deleting participant availability', async () => {
      // Setup axios mock to throw error
      mockedAxios.delete.mockRejectedValueOnce(new Error('Network error'));

      // Execute and assert
      await expect(deleteParticipantAvailability('test@example.com', 'test-event-id')).rejects.toThrow('Failed to delete participant availability.');
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/event/deleteParticipantAvailability', {
        data: {
          email: 'test@example.com',
          eventId: 'test-event-id'
        }
      });
    });
  });
}); 