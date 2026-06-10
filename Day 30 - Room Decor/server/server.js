import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import { createReadStream } from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
const clientDir = path.join(__dirname, "..", "client");
const imageModel = process.env.IMAGE_MODEL || "gpt-image-1-mini";
const imageProvider = process.env.IMAGE_PROVIDER || "images";
const responsesModel = process.env.RESPONSES_MODEL || "gpt-4.1-mini";

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(clientDir));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

app.get("/api/debug-config", (_, res) => {
  res.json({
    ok: true,
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    imageProvider,
    responsesModel,
    imageModel: imageProvider === "images" ? imageModel : null,
    openAIOrgConfigured: Boolean(process.env.OPENAI_ORG_ID),
    openAIProjectConfigured: Boolean(process.env.OPENAI_PROJECT_ID),
  });
});

function getOpenAIErrorDetails(error) {
  return {
    status: error?.status,
    code: error?.code,
    param: error?.param,
    type: error?.type,
    requestID: error?.requestID,
    message: error?.message || "Something went wrong.",
  };
}

function getGeneratedImageFromResponse(response) {
  const imageOutput = response.output
    ?.filter((item) => item.type === "image_generation_call")
    .find((item) => item.result);

  return imageOutput?.result || null;
}

async function waitForOpenAIRequest(requestId, label, requestPromise) {
  const startedAt = Date.now();
  const heartbeat = setInterval(() => {
    const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
    console.log(`[${requestId}] Still waiting for ${label}`, {
      elapsedSeconds,
    });
  }, 15000);

  try {
    return await requestPromise;
  } finally {
    clearInterval(heartbeat);
  }
}

app.post("/api/edit-room", upload.single("roomImage"), async (req, res) => {
  const requestId = crypto.randomUUID();
  let uploadedFilePath = null;

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing in server/.env.",
      });
    }

    const file = req.file;
    const prompt = req.body.prompt?.trim();

    if (!file) {
      return res.status(400).json({ error: "Room image is required." });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    uploadedFilePath = file.path;

    console.log(`[${requestId}] Room edit request received`, {
      provider: imageProvider,
      responsesModel,
      imageModel: imageProvider === "images" ? imageModel : undefined,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      promptLength: prompt.length,
    });

    const instruction = `
Edit this uploaded room photo realistically.

Keep:
- the same room structure
- the same camera angle and perspective
- the same wall/floor layout
- the same overall room identity

Only change styling, decor, colors, furniture appearance, materials, ambiance, and design details based on this request:

${prompt}

Requirements:
- photorealistic
- believable interior design result
- realistic scale and furniture proportions
- natural looking lighting
- preserve the actual room, do not transform it into a different space
`;

    let generatedImage = null;

    if (imageProvider === "responses") {
      const imageBase64 = fs.readFileSync(uploadedFilePath, {
        encoding: "base64",
      });

      console.log(`[${requestId}] Calling OpenAI Responses API`, {
        model: responsesModel,
        tool: "image_generation",
        imageBytesBase64: imageBase64.length,
      });

      const response = await waitForOpenAIRequest(
        requestId,
        "OpenAI Responses API",
        openai.responses.create(
          {
            model: responsesModel,
            input: [
              {
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: instruction,
                  },
                  {
                    type: "input_image",
                    image_url: `data:${file.mimetype};base64,${imageBase64}`,
                  },
                ],
              },
            ],
            tools: [{ type: "image_generation" }],
          },
          {
            timeout: 5 * 60 * 1000,
          },
        ),
      );

      console.log(`[${requestId}] OpenAI Responses API returned`, {
        responseId: response.id,
        status: response.status,
        outputTypes: response.output?.map((item) => item.type),
        hasOutputText: Boolean(response.output_text),
      });

      generatedImage = getGeneratedImageFromResponse(response);
    } else {
      const imageEditRequest = {
        model: imageModel,
        image: createReadStream(uploadedFilePath),
        prompt: instruction,
      };

      if (imageModel === "dall-e-2") {
        imageEditRequest.response_format = "b64_json";
        imageEditRequest.size = "1024x1024";
      }

      console.log(`[${requestId}] Calling OpenAI Images API`, {
        model: imageEditRequest.model,
      });

      const response = await waitForOpenAIRequest(
        requestId,
        "OpenAI Images API",
        openai.images.edit(imageEditRequest, {
          timeout: 5 * 60 * 1000,
        }),
      );
      generatedImage = response.data?.[0]?.b64_json;

      console.log(`[${requestId}] OpenAI Images API returned`, {
        imageCount: response.data?.length || 0,
        hasImage: Boolean(generatedImage),
      });
    }

    if (!generatedImage) {
      console.error(`[${requestId}] No image was returned by OpenAI.`);
      return res.status(500).json({
        error:
          "No image was returned by OpenAI. Check the server log for model access details.",
        requestId,
      });
    }

    console.log(`[${requestId}] Returning generated image`, {
      imageBase64Length: generatedImage.length,
    });

    return res.json({
      success: true,
      image: `data:image/png;base64,${generatedImage}`,
      requestId,
    });
  } catch (error) {
    const details = getOpenAIErrorDetails(error);
    console.error(`[${requestId}] Server error`, details);

    return res.status(500).json({
      error: details.message,
      requestId,
      details,
    });
  } finally {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open the app at http://localhost:${PORT}/`);
  console.log(`Image provider: ${imageProvider}`);
  if (imageProvider === "images") {
    console.log(`Images API model: ${imageModel}`);
  }
  if (imageProvider === "responses") {
    console.log(`Responses API model: ${responsesModel}`);
  }
  console.log(`OpenAI org configured: ${process.env.OPENAI_ORG_ID || "not set"}`);
  console.log(`OpenAI project configured: ${process.env.OPENAI_PROJECT_ID || "not set"}`);
});
