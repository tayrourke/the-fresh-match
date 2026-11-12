/** A finished match goes to Taylor's First Seeds leads. Nowhere else. */

const SUPABASE_URL = "https://pqznpgqnfmnsvdgcwxiy.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxem5wZ3FuZm1uc3ZkZ2N3eGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2OTgyOTgsImV4cCI6MjEwMTI3NDI5OH0.prNKV7vbSNVNY0sqft4EjAdNeM10bg-seOUth3pIsQA";

export async function sendQuizLead({ name, email, social, matchUrl }) {
  const body = {
    p_slug: "taylor",
    p_name: String(name || "").trim(),
    p_email: String(email || "").trim(),
    p_ig: String(social || "").trim(),
    p_match: String(matchUrl || "").trim(),
  };
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 8000) : null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_quiz_lead`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined,
    });
    if (!res.ok) return { ok: false, reason: "save" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "save" };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
