# AI Room Decor App

AI Room Decor is a full-stack web app that lets users upload a room photo and generate a redesigned version of the space using OpenAI GPT mini image generation.

Users can describe their desired redesign manually or choose from curated interior design presets like Japandi, Organic Modern, and Quiet Luxury.

<img width="2277" height="1487" alt="1" src="https://github.com/user-attachments/assets/8340bb8e-3aa0-4d9d-8d60-22dd9fd08051" />

## Features

- Upload a room photo
- Generate AI-powered room redesigns
- Before-and-after image preview
- Modern minimal UI
- Curated design presets
- GPT mini image generation through the OpenAI Responses API
- Node.js and Express backend
- Client-side image preparation before upload
- Server-side debug logging for API requests

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Node.js
- Express
- Multer
- OpenAI API

## How It Works

1. The user uploads a room image.
2. The frontend prepares the image for generation.
3. The image and prompt are sent to the Express backend.
4. The backend sends the request to the OpenAI Responses API.
5. OpenAI returns a generated room redesign.
6. The app displays the original and redesigned room side by side.

## Design Presets

The app includes three preset design directions:

- Japandi
- Organic Modern
- Quiet Luxury

Each preset fills the prompt box with a detailed design direction to help guide the image generation result.

## Project Structure

```text
Day 30 - Room Decor/
├── client/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env
├── .gitignore
└── README.md
```

## Setup

### 1. Clone the repository

```bash
git clone [your-repo-url]
cd "Day 30 - Room Decor"
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Create a `.env` file

Inside the `server` folder, create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=4000
IMAGE_PROVIDER=responses
RESPONSES_MODEL=gpt-4.1-mini
```

### 4. Start the server

```bash
npm start
```

### 5. Open the app

Open this URL in your browser:

```text
http://localhost:4000/
```

## API Endpoints

### Health Check

```http
GET /api/health
```

Returns:

```json
{
  "ok": true
}
```

### Debug Config

```http
GET /api/debug-config
```

Returns safe configuration details without exposing the API key.

### Generate Room Redesign

```http
POST /api/edit-room
```

Accepts multipart form data:

- `roomImage`: uploaded image file
- `prompt`: redesign prompt

Returns:

```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "requestId": "..."
}
```

## Notes

This project uses the OpenAI Responses API with GPT mini image generation. Make sure your OpenAI project has billing enabled and access to the selected model.

## Future Improvements

- Add download button for generated images
- Add more interior design presets
- Add aspect ratio controls
- Add prompt history
- Add user accounts
- Add gallery of previous generations
- Improve production security
- Deploy as a standalone app

## Day 30 / 30

This project is part of my 30 days of building AI-powered apps.
