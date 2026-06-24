from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_ai_reply(lead_name: str, conversation_history: list) -> str:
    messages = [
        {
            "role": "system",
            "content": f"""You are Aria, a sharp and friendly sales assistant.

Rules:
- Keep replies SHORT — maximum 3 sentences
- Use bullet points or numbered lists when listing things
- Get straight to the point — no fluff
- For pricing, show it like:
  • Basic: $X/month
  • Pro: $X/month
- End with ONE short question
- Never repeat what the user said
- Sound human, not robotic
- Use proper line spacing and line break

You are talking to: {lead_name}"""
        }
    ]
    for msg in conversation_history:
        if msg["sender"] == "lead":
            messages.append({"role": "user", "content": msg["message"]})
        else:
            messages.append({"role": "assistant", "content": msg["message"]})

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=150,
        temperature=0.7
    )

    return response.choices[0].message.content


def qualify_and_score_lead(lead_name: str, conversation_history: list) -> dict:
    conversation_text = "\n".join([
        f"{msg['sender'].upper()}: {msg['message']}"
        for msg in conversation_history
    ])

    if not conversation_text:
        return {"score": "COLD", "score_value": 10.0, "reason": "No conversation yet"}

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": """You are a lead qualification expert. Analyze the conversation and score the lead.
Return ONLY a JSON object with these exact fields, no other text:
{
  "score": "HOT" or "MEDIUM" or "COLD",
  "score_value": number between 0 and 100,
  "reason": "one sentence explanation"
}

Scoring guide:
HOT (70-100): Strong interest, ready to buy, asked about pricing or demo
MEDIUM (40-69): Some interest, asking questions, needs nurturing
COLD (0-39): No interest, unresponsive, or just browsing"""
            },
            {
                "role": "user",
                "content": f"Lead name: {lead_name}\n\nConversation:\n{conversation_text}"
            }
        ],
        max_tokens=150,
        temperature=0.3
    )

    try:
        content = response.choices[0].message.content
        # Clean up response in case model adds extra text
        start = content.find("{")
        end = content.rfind("}") + 1
        json_str = content[start:end]
        result = json.loads(json_str)
        return result
    except:
        return {"score": "COLD", "score_value": 0.0, "reason": "Could not analyze"}


def generate_followup_message(lead_name: str, last_message: str, days_inactive: int) -> str:
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are a sales assistant writing a follow-up message. Keep it short (2-3 sentences), friendly, and not pushy."
            },
            {
                "role": "user",
                "content": f"Write a follow-up message for lead: {lead_name}. Their last message was: '{last_message}'. They have been inactive for {days_inactive} days."
            }
        ],
        max_tokens=100,
        temperature=0.7
    )

    return response.choices[0].message.content