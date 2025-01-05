interface VoteConfirmationEmailProps {
  eventName: string;
  participantName: string;
  dateTime: string;
}

export function VoteConfirmationEmail({ eventName, participantName, dateTime }: VoteConfirmationEmailProps) {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Thanks for voting, ${participantName}!</h2>
          <p>You've successfully voted for the event "${eventName}".</p>
          <p>Selected time slot: ${dateTime}</p>
          <p>We'll notify you once the final time is confirmed.</p>
          <br/>
          <p>Best regards,</p>
          <p>Your Event Team</p>
        </div>
      </body>
    </html>
  `;
}