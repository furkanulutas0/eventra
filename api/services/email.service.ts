import { Resend } from 'resend';
import { VoteConfirmationEmail } from '../templates/voteConfirmation';
import { EventCompletionNotification } from '../templates/eventCompletionNotification';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendVoteConfirmation(
    recipientEmail: string,
    participantName: string,
    eventName: string,
    dateTime: string
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Eventra <eventra@douloop.com>', // Update with your verified domain
        to: recipientEmail,
        subject: `Vote Confirmation - ${eventName}`,
        html: VoteConfirmationEmail({
          eventName,
          participantName,
          dateTime,
        }),
      });

      if (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  }

  static async sendEventCompletionNotification(
    recipientEmail: string,
    participantName: string,
    eventName: string,
    finalDateTime?: string,
    eventLocation?: string,
    eventDetails?: string
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Eventra <eventra@douloop.com>', // Update with your verified domain
        to: recipientEmail,
        subject: `Event Completed - ${eventName}`,
        html: EventCompletionNotification({
          eventName,
          participantName,
          finalDateTime,
          eventLocation,
          eventDetails,
        }),
      });

      if (error) {
        console.error('Failed to send event completion notification:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Event completion notification error:', error);
      return { success: false, error };
    }
  }
  
}