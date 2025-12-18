export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  let body = "";
  for await (const chunk of req) body += chunk;
  const { sdp } = JSON.parse(body);

  const session = {
    model: "gpt-4o-realtime-preview",
    voice: "alloy",
    instructions: "You are Aerlo Exec. Run the voice interview and output YOUR SYSTEM PROMPT at the end."
  };

  const fd = new FormData();
  fd.append("sdp", new Blob([sdp], { type: "application/sdp" }));
  fd.append("session", new Blob([JSON.stringify(session)], { type: "application/json" }));

  const r = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: fd
  });

  const answer = await r.text();
  res.setHeader("Content-Type", "application/sdp");
  res.status(200).send(answer);
}

