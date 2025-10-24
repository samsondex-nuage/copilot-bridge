import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// From Render env vars
const COPILOT_ENDPOINT = process.env.COPILOT_ENDPOINT; // your Web App “connection string” URL OR base endpoint
const COPILOT_AUTH     = process.env.COPILOT_AUTH;     // same connection string used as Authorization

app.get("/", (_req, res) => res.send("Copilot bridge is running. POST /copilot"));

app.post("/copilot", async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question) return res.status(400).json({ error: "Missing 'question'" });
    if (!COPILOT_ENDPOINT) throw new Error("Missing COPILOT_ENDPOINT env var");
    if (!COPILOT_AUTH)     throw new Error("Missing COPILOT_AUTH env var");

    // Send to Copilot Studio Web App channel
    const upstream = await fetch(COPILOT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // IMPORTANT: Copilot expects an Authorization header
        "Authorization": COPILOT_AUTH           // <-- key change
        // If your tenant expects Bearer format, use:
        // "Authorization": `Bearer ${COPILOT_AUTH}`
      },
      body: JSON.stringify({ text: question })
    });

    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bridge listening on :${PORT}`));
