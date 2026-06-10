import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

function buildReadmePrompt(data) {
  const {
    projectName = "",
    description = "",
    techStack = "",
    features = "",
    installation = "",
    usage = "",
    license = "",
    tone = "Professional",
  } = data;

  return `
Generate a clean, professional GitHub README.md in markdown format.

Rules:
- Return ONLY markdown
- Do not wrap the response in triple backticks
- Use clear section headings
- Keep it polished and concise
- If some fields are missing, intelligently omit or simplify sections
- Tone: ${tone}

Project details:
Project Name: ${projectName}
Description: ${description}
Tech Stack: ${techStack}
Features: ${features}
Installation: ${installation}
Usage: ${usage}
License: ${license}

Include these sections when relevant:
- Title
- Description
- Features
- Tech Stack
- Installation
- Usage
- License
- Future Improvements
`;
}

app.get("/", (req, res) => {
  res.json({ message: "READMEForge API is running." });
});

app.post("/generate-readme", async (req, res) => {
  try {
    const {
      projectName,
      description,
      techStack,
      features,
      installation,
      usage,
      license,
      tone,
    } = req.body;

    if (!projectName || !description) {
      return res.status(400).json({
        error: "Project name and description are required.",
      });
    }

    const prompt = buildReadmePrompt({
      projectName,
      description,
      techStack,
      features,
      installation,
      usage,
      license,
      tone,
    });

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: prompt,
    });

    return res.status(200).json({
      success: true,
      markdown: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to generate README.",
      details: error?.message || "Unknown server error",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
