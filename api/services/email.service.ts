import { Resend } from 'resend';
import { VoteConfirmationEmail } from '../templates/voteConfirmation';

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
        from: 'Eventra <eventra@mail.douloop.com>', // Update with your verified domain
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
}