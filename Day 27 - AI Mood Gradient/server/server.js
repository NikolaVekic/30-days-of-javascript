import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const clientDir = path.join(__dirname, "../client");
app.use(express.static(clientDir));

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) throw new Error("Missing OPENAI_API_KEY in server/.env");

app.post("/api/gradient", async (req, res) => {
  const mood = String(req.body?.mood || "")
    .trim()
    .slice(0, 120);
  if (!mood) return res.status(400).json({ error: "Missing mood" });

  const prompt = `
Return ONLY valid JSON (no markdown):
{"colors":["#RRGGBB","#RRGGBB","#RRGGBB"],"gradient":"linear-gradient(135deg, #RRGGBB, #RRGGBB, #RRGGBB)"}
Rules:
- exactly 3 UNIQUE hex colors
- match the mood: ${JSON.stringify(mood)}
- gradient must be linear-gradient(135deg, ...)
`;

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
    });

    const data = await r.json();
    if (!r.ok)
      return res
        .status(r.status)
        .json({ error: data?.error?.message || "OpenAI error" });

    const text =
      data.output_text ||
      data.output
        ?.flatMap((o) => o.content || [])
        ?.map((c) => c.text)
        .filter(Boolean)
        .join("\n") ||
      "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res
        .status(500)
        .json({ error: "Model returned non-JSON. Try again." });
    }

    // quick validation
    const ok =
      parsed &&
      Array.isArray(parsed.colors) &&
      parsed.colors.length === 3 &&
      parsed.colors.every((c) => /^#[0-9a-fA-F]{6}$/.test(c)) &&
      typeof parsed.gradient === "string" &&
      parsed.gradient.startsWith("linear-gradient");

    if (!ok)
      return res.status(500).json({ error: "Bad response format. Try again." });

    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`http://localhost:${process.env.PORT || 3000}`);
});
