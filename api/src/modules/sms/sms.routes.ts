import { Router } from "express";
import twilio from "twilio";

export const smsRouter = Router();

smsRouter.post("/send-sms", async (req, res) => {
  const { to, message } = req.body as { to?: unknown; message?: unknown };
  if (
    typeof to !== "string" ||
    typeof message !== "string" ||
    !to.trim() ||
    !message.trim()
  ) {
    return res.status(400).json({ error: "Missing 'to' or 'message' field" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || !messagingServiceSid) {
    console.error("Twilio env missing: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID");
    return res.status(503).json({ error: "SMS service not configured" });
  }

  const normalized = normalizeToE164(to);
  if (!normalized) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  try {
    const client = twilio(accountSid, authToken);
    const response = await client.messages.create({
      messagingServiceSid,
      to: "+48791790090",
      body: message,
    });
    console.log("SMS sent:", response.sid);
    res.json({ success: true, sid: response.sid });
  } catch (err: unknown) {
    console.error("Twilio SMS error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});

/** Best-effort E.164 for numbers stored without a country prefix (defaults to Poland +48). */
function normalizeToE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (hasPlus) return `+${digits}`;
  if (digits.length === 9) return `+48${digits}`;
  if (digits.length === 11 && digits.startsWith("48")) return `+${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  return `+${digits}`;
}
