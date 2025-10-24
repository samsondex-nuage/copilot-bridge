import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// This will hold your Copilot Studio endpoint (we’ll add it in Render later)
const COPILOT_ENDPOINT = process.env.COPILOT_ENDPOINT;

app.get("/", (_req, res) => res.send("Copilot bridge is running. POST /copilot"));

app.post("/copilot", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Missing question" });
    if (!COPILOT_ENDPOINT) throw new Error("Missing COPILOT_ENDPOINT env var");

    const copilotRes = await fetch(COPILOT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: question })
    });

    const data = await copilotRes.text();
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
