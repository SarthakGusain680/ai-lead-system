import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL")


def send_new_lead_notification(
    lead_name: str,
    lead_email: str,
    lead_message: str,
    source: str = "chat_widget"
):
    """
    Send email notification when a new lead starts chatting.
    """
    if not resend.api_key or not NOTIFICATION_EMAIL:
        print("Email notification skipped - missing API key or notification email")
        return

    try:
        params = {
            "from": "AI Lead System <onboarding@resend.dev>",
            "to": [NOTIFICATION_EMAIL],
            "subject": f"New Lead: {lead_name}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">New Lead Alert!</h1>
                </div>
                <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0;">
                    <h2 style="color: #1e293b; margin-top: 0;">Lead Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; width: 120px;">Name:</td>
                            <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">{lead_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">Email:</td>
                            <td style="padding: 8px 0; color: #1e293b;">{lead_email or "Not provided"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">Source:</td>
                            <td style="padding: 8px 0; color: #1e293b;">{source}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Message:</td>
                            <td style="padding: 8px 0; color: #1e293b; font-style: italic;">"{lead_message}"</td>
                        </tr>
                    </table>
                    <div style="margin-top: 24px;">
                        <a href="https://ai-lead-system-pvc7.vercel.app/leads" 
                           style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                            View in Dashboard
                        </a>
                    </div>
                </div>
                <div style="background: #e2e8f0; padding: 12px; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="color: #64748b; margin: 0; font-size: 12px;">AI Lead Follow-Up System</p>
                </div>
            </div>
            """,
        }
        resend.Emails.send(params)
        print(f"Email notification sent for lead: {lead_name}")
    except Exception as e:
        print(f"Failed to send email notification: {e}")