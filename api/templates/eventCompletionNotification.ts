interface EventCompletionNotificationProps {
  eventName: string;
  participantName: string;
  finalDateTime?: string;
  eventLocation?: string;
  eventDetails?: string;
}

export function EventCompletionNotification({ 
  eventName, 
  participantName, 
  finalDateTime, 
  eventLocation, 
  eventDetails 
}: EventCompletionNotificationProps) {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Event Completed: ${eventName}</h2>
            
            <p style="color: #374151; margin-bottom: 16px;">Hi ${participantName},</p>
            
            <p style="color: #374151; margin-bottom: 16px;">
              The voting for "${eventName}" has been completed and the event has been finalized.
            </p>
            
            ${finalDateTime ? `
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">📅 Final Date & Time</h3>
                <p style="color: #1e40af; margin: 0; font-weight: 600;">${finalDateTime}</p>
              </div>
            ` : ''}
            
            ${eventLocation ? `
              <div style="margin: 16px 0;">
                <h3 style="color: #374151; margin: 0 0 8px 0; font-size: 16px;">📍 Location</h3>
                <p style="color: #6b7280; margin: 0;">${eventLocation}</p>
              </div>
            ` : ''}
            
            ${eventDetails ? `
              <div style="margin: 16px 0;">
                <h3 style="color: #374151; margin: 0 0 8px 0; font-size: 16px;">ℹ️ Event Details</h3>
                <p style="color: #6b7280; margin: 0; white-space: pre-line;">${eventDetails}</p>
              </div>
            ` : ''}
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 24px 0;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                💡 <strong>What's next?</strong> Please add this event to your calendar and prepare for the scheduled time. 
                If you have any questions, please contact the event organizer.
              </p>
            </div>
            
            <p style="color: #374151; margin-bottom: 8px;">
              Thank you for participating in the scheduling process!
            </p>
            
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Best regards,<br>
              The Eventra Team
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
