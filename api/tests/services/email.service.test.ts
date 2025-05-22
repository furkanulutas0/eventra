import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EmailService } from '../../services/email.service';
import { Resend } from 'resend';

// Mock Resend and templates
vi.mock('resend');
vi.mock('../../templates/voteConfirmation', () => ({
  VoteConfirmationEmail: vi.fn((props) => {
    // Validate that required props are passed
    if (!props.eventName || !props.participantName || !props.dateTime) {
      throw new Error('Missing required props');
    }
    return '<html>Mocked Email Template</html>';
  })
}));

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...process.env };
    process.env.RESEND_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('sendVoteConfirmation', () => {
    it('should send vote confirmation email successfully', async () => {
      // Mock data
      const recipientEmail = 'test@example.com';
      const participantName = 'Test User';
      const eventName = 'Test Event';
      const dateTime = 'June 15, 2023 at 10:00 - 11:00';

      // Mock successful email sending
      const mockSend = vi.fn().mockResolvedValue({
        data: { id: 'email-id' },
        error: null
      });

      // Setup mock implementation
      (Resend as any).mockImplementation(() => ({
        emails: {
          send: mockSend
        }
      }));

      // Execute the service method
      const result = await EmailService.sendVoteConfirmation(
        recipientEmail,
        participantName,
        eventName,
        dateTime
      );

      // Assertions
      expect(result).toEqual({
        success: true,
        data: { id: 'email-id' }
      });
    });

    it('should handle email sending failure', async () => {
      // Mock data
      const recipientEmail = 'test@example.com';
      const participantName = 'Test User';
      const eventName = 'Test Event';
      const dateTime = 'June 15, 2023 at 10:00 - 11:00';

      // Mock failed email sending
      const mockSend = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Failed to send email')
      });

      // Setup mock implementation
      (Resend as any).mockImplementation(() => ({
        emails: {
          send: mockSend
        }
      }));

      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Execute the service method
      const result = await EmailService.sendVoteConfirmation(
        recipientEmail,
        participantName,
        eventName,
        dateTime
      );

      // Assertions
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: new Error('Failed to send email')
      });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('should handle exceptions during email sending', async () => {
      // Mock data
      const recipientEmail = 'test@example.com';
      const participantName = 'Test User';
      const eventName = 'Test Event';
      const dateTime = 'June 15, 2023 at 10:00 - 11:00';

      // Mock exception during email sending
      const mockSend = vi.fn().mockRejectedValue(new Error('Network error'));

      // Setup mock implementation
      (Resend as any).mockImplementation(() => ({
        emails: {
          send: mockSend
        }
      }));

      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Execute the service method
      const result = await EmailService.sendVoteConfirmation(
        recipientEmail,
        participantName,
        eventName,
        dateTime
      );

      // Assertions
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: new Error('Network error')
      });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
}); 