import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mockRequest, mockResponse, mockNext } from '../setup';
import { EventController } from '../../controllers/event/controller';
import { supabase } from '../../utils/supabase';
import { EmailService } from '../../services/email.service';

// Mock EmailService
vi.mock('../../services/email.service', () => ({
  EmailService: {
    sendVoteConfirmation: vi.fn().mockResolvedValue({ success: true }),
  },
}));

describe('EventController', () => {
  let eventController: EventController;
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    eventController = new EventController();
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('addEvent', () => {
    it('should create a new event successfully', async () => {
      // Mock request data
      req.body = {
        type: '1:1',
        name: 'Test Event',
        detail: 'Test event details',
        location: 'Test location',
        dateTimeSlots: [
          {
            date: new Date('2023-06-15'),
            timeSlots: [
              { startTime: '10:00', endTime: '11:00' },
              { startTime: '14:00', endTime: '15:00' }
            ]
          }
        ],
        isAnonymousAllowed: true,
        can_multiple_vote: true,
        creator_id: 'test-creator-id'
      };

      // Mock environment variable
      process.env.FRONTEND_URL = 'http://localhost:3000';

      // Mock Supabase responses for user check
      (supabase.from as any).mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: () => ({
              eq: () => Promise.resolve({
                data: [{ uuid: 'test-creator-id' }],
                error: null
              })
            })
          };
        } else if (table === 'events') {
          return {
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: { id: 'eventra-test-123', share_url: 'http://localhost:3000/event/share/eventra-test-123' },
                  error: null
                })
              })
            })
          };
        } else if (table === 'event_dates') {
          return {
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: { id: 1 },
                  error: null
                })
              })
            })
          };
        } else if (table === 'event_time_slots') {
          return {
            insert: () => Promise.resolve({
              data: [{ id: 1 }, { id: 2 }],
              error: null
            })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnThis(),
        };
      });

      // Execute the controller method
      await eventController.addEvent(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Event created successfully',
          data: expect.objectContaining({
            eventId: expect.any(String),
            shareUrl: expect.any(String)
          })
        })
      );
    });

    it('should handle database error during event creation', async () => {
      // Mock request data
      req.body = {
        type: '1:1',
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
        isAnonymousAllowed: true,
        can_multiple_vote: true,
        creator_id: 'test-creator-id'
      };

      // Mock Supabase responses with error
      (supabase.from as any).mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: () => ({
              eq: () => Promise.resolve({
                data: [{ uuid: 'test-creator-id' }],
                error: null
              })
            })
          };
        } else if (table === 'events') {
          return {
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: null,
                  error: new Error('Database error')
                })
              })
            })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnThis(),
        };
      });

      // Execute the controller method
      await eventController.addEvent(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getEvent', () => {
    it('should retrieve event data successfully', async () => {
      // Mock request data
      req.query = {
        event_id: 'test-event-id'
      };

      // Mock event data
      const mockEventData = {
        id: 'test-event-id',
        name: 'Test Event',
        type: '1:1',
        creator_id: 'test-creator-id',
        event_dates: [
          {
            id: 1,
            date: '2023-06-15',
            event_time_slots: [
              { id: 1, start_time: '10:00', end_time: '11:00' }
            ]
          }
        ],
        event_participants: [],
        event_schedule: [],
        event_votes: []
      };

      // Mock Supabase response
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('events');
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: mockEventData,
                error: null
              })
            })
          })
        };
      });

      // Execute the controller method
      await eventController.getEvent(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockEventData
      });
    });

    it('should handle error when event is not found', async () => {
      // Mock request data
      req.query = {
        event_id: 'nonexistent-event-id'
      };

      // Mock Supabase response
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('events');
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: null,
                error: new Error('Event not found')
              })
            })
          })
        };
      });

      // Execute the controller method
      await eventController.getEvent(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getEventByUser', () => {
    it('should retrieve events by user successfully', async () => {
      // Mock request data
      req.query = {
        creator_id: 'test-creator-id'
      };

      // Mock events data
      const mockEventsData = [
        {
          id: 'test-event-id-1',
          name: 'Test Event 1',
          type: '1:1'
        },
        {
          id: 'test-event-id-2',
          name: 'Test Event 2',
          type: 'group'
        }
      ];

      // Mock Supabase response
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('events');
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({
                data: mockEventsData,
                error: null
              })
            })
          })
        };
      });

      // Execute the controller method
      await eventController.getEventByUser(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockEventsData
      });
    });

    it('should handle error when retrieving events', async () => {
      // Mock request data
      req.query = {
        creator_id: 'test-creator-id'
      };

      // Mock Supabase response with error
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('events');
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({
                data: null,
                error: new Error('Database error')
              })
            })
          })
        };
      });

      // Execute the controller method
      await eventController.getEventByUser(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateEventStatus', () => {
    it('should update event status successfully', async () => {
      // Mock request data
      req.body = {
        event_id: 'test-event-id',
        status: 'completed'
      };

      // Mock Supabase response
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('events');
        return {
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: { id: 'test-event-id', status: 'completed' },
                  error: null
                })
              })
            })
          })
        };
      });

      // Execute the controller method
      await eventController.updateEventStatus(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Event status updated successfully',
        data: expect.objectContaining({
          id: 'test-event-id',
          status: 'completed'
        })
      });
    });

    it('should handle error when updating event status', async () => {
      // Mock request data
      req.body = {
        event_id: 'test-event-id',
        status: 'completed'
      };

      // Mock Supabase response with error
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('events');
        return {
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: null,
                  error: new Error('Database error')
                })
              })
            })
          })
        };
      });

      // Execute the controller method
      await eventController.updateEventStatus(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });
  });

  describe('submitAvailability', () => {
    it('should submit participant availability successfully', async () => {
      // Mock request data
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        isAnonymous: false,
        eventId: 'test-event-id',
        timeSlotIds: ['1', '2']
      };

      // Mock event data
      const mockEventData = {
        id: 'test-event-id',
        name: 'Test Event',
        status: 'pending',
        event_dates: [
          {
            date: '2023-06-15',
            event_time_slots: [
              { id: '1', start_time: '10:00', end_time: '11:00' },
              { id: '2', start_time: '14:00', end_time: '15:00' }
            ]
          }
        ]
      };

      // Mock Supabase responses
      (supabase.from as any).mockImplementation((table) => {
        if (table === 'events') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: mockEventData,
                  error: null
                })
              })
            })
          };
        } else if (table === 'event_participants') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({
                    data: null,
                    error: { code: 'PGRST116' } // No rows found error
                  })
                })
              })
            }),
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: { id: 1 },
                  error: null
                })
              })
            })
          };
        } else if (table === 'users') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { uuid: 'test-user-id', name: 'Test User' },
                  error: null
                })
              })
            })
          };
        } else if (table === 'participant_availability') {
          return {
            insert: () => Promise.resolve({
              data: [{ id: 1 }, { id: 2 }],
              error: null
            })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnThis(),
        };
      });

      // Execute the controller method
      await eventController.submitAvailability(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Availability submitted successfully'
      });
      expect(EmailService.sendVoteConfirmation).toHaveBeenCalled();
    });

    it('should handle duplicate email submission', async () => {
      // Mock request data
      req.body = {
        name: 'Test User',
        email: 'existing@example.com',
        isAnonymous: false,
        eventId: 'test-event-id',
        timeSlotIds: ['1', '2']
      };

      // Mock Supabase responses for existing participant
      (supabase.from as any).mockImplementation((table) => {
        if (table === 'events') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { status: 'pending' },
                  error: null
                })
              })
            })
          };
        } else if (table === 'event_participants') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({
                    data: {
                      id: 1,
                      is_anonymous: false,
                      participant_name: 'Existing User',
                      participant_email: 'existing@example.com'
                    },
                    error: null
                  })
                })
              })
            })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnThis(),
        };
      });

      // Execute the controller method
      await eventController.submitAvailability(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'duplicate',
        message: 'Email already exists',
        data: expect.objectContaining({
          participantId: 1,
          existingName: 'Existing User',
          existingEmail: 'existing@example.com'
        })
      });
    });

    it('should handle completed events', async () => {
      // Mock request data
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        isAnonymous: false,
        eventId: 'test-event-id',
        timeSlotIds: ['1', '2']
      };

      // Mock Supabase responses for completed event
      (supabase.from as any).mockImplementation((table) => {
        if (table === 'events') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { status: 'completed' },
                  error: null
                })
              })
            })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnThis(),
        };
      });

      // Execute the controller method
      await eventController.submitAvailability(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'This poll has ended and is no longer accepting responses'
      });
    });
  });

  describe('deleteEvent', () => {
    it('should mark an event as deleted successfully', async () => {
      // Mock request params
      req.params = {
        event_id: 'test-event-id'
      };

      // Mock Supabase response
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('events');
        return {
          update: () => ({
            eq: () => Promise.resolve({
              data: { id: 'test-event-id', deleted: true },
              error: null
            })
          })
        };
      });

      // Execute the controller method
      await eventController.deleteEvent(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Event marked as deleted successfully'
      });
    });

    it('should handle error when deleting event', async () => {
      // Mock request params
      req.params = {
        event_id: 'test-event-id'
      };

      // Mock Supabase response with error
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('events');
        return {
          update: () => ({
            eq: () => Promise.resolve({
              data: null,
              error: new Error('Database error')
            })
          })
        };
      });

      // Execute the controller method
      await eventController.deleteEvent(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });
  });

  describe('deleteParticipantAvailability', () => {
    it('should delete participant availability successfully', async () => {
      // Mock request body
      req.body = {
        email: 'test@example.com',
        eventId: 'test-event-id'
      };

      // Mock Supabase responses
      (supabase.from as any).mockImplementation((table) => {
        if (table === 'event_participants') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({
                    data: { id: 1 },
                    error: null
                  })
                })
              })
            }),
            delete: () => ({
              eq: () => Promise.resolve({
                data: null,
                error: null
              })
            })
          };
        } else if (table === 'participant_availability') {
          return {
            delete: () => ({
              eq: () => Promise.resolve({
                data: null,
                error: null
              })
            })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnThis(),
        };
      });

      // Execute the controller method
      await eventController.deleteParticipantAvailability(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Participant availability deleted successfully'
      });
    });

    it('should handle participant not found', async () => {
      // Mock request body
      req.body = {
        email: 'nonexistent@example.com',
        eventId: 'test-event-id'
      };

      // Mock Supabase response for non-existent participant
      (supabase.from as any).mockImplementation((table) => {
        if (table === 'event_participants') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({
                    data: null,
                    error: { code: 'PGRST116' } // No rows found error
                  })
                })
              })
            })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnThis(),
        };
      });

      // Execute the controller method
      await eventController.deleteParticipantAvailability(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Participant not found'
      });
    });

    it('should handle error when deleting availability', async () => {
      // Mock request body
      req.body = {
        email: 'test@example.com',
        eventId: 'test-event-id'
      };

      // Mock Supabase responses with error
      (supabase.from as any).mockImplementation((table) => {
        if (table === 'event_participants') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({
                    data: { id: 1 },
                    error: null
                  })
                })
              })
            })
          };
        } else if (table === 'participant_availability') {
          return {
            delete: () => ({
              eq: () => Promise.resolve({
                data: null,
                error: new Error('Database error')
              })
            })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnThis(),
        };
      });

      // Execute the controller method
      await eventController.deleteParticipantAvailability(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });
  });
}); 