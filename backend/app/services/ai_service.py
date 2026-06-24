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
            "content": f"""You are a friendly and professional AI sales assistant named "Aria" working for a business.

Your goals:
- Greet the lead warmly by their name
- Understand their needs and pain points
- Answer questions clearly with specific details
- Guide them toward booking a demo or making a purchase
- Always end with ONE specific question to keep conversation going
- Write at least 2-3 complete sentences every time
- If asked about pricing, give specific numbers
- If asked about features, give concrete examples
- Be conversational, warm and helpful — not robotic

The lead you are talking to is named {lead_name}.
Never start your response with a comma or incomplete sentence.
Never say you are an AI language model."""
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