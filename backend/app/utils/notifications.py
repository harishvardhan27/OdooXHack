from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client
import os

SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE = os.getenv('TWILIO_PHONE')

sg_client = SendGridAPIClient(SENDGRID_API_KEY)
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_email(to_email: str, subject: str, content: str):
    message = Mail(
        from_email='notifications@communitypulse.com',
        to_emails=to_email,
        subject=subject,
        html_content=content
    )
    try:
        response = sg_client.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_sms(to_phone: str, message: str):
    try:
        twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE,
            to=to_phone
        )
        return True
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False

def send_rsvp_confirmation(rsvp, event):
    subject = f"RSVP Confirmation: {event.title}"
    message = f"""
    <h2>Thank you for RSVPing!</h2>
    <p>You're confirmed for <strong>{event.title}</strong></p>
    <p><strong>When:</strong> {event.date.strftime('%A, %B %d at %I:%M %p')}</p>
    <p><strong>Where:</strong> {event.location}</p>
    <p><strong>Attendees:</strong> {rsvp.attendee_count}</p>
    """
    
    if rsvp.email:
        send_email(rsvp.email, subject, message)
    if rsvp.phone:
        send_sms(rsvp.phone, f"RSVP confirmed for {event.title} on {event.date.strftime('%m/%d')}")