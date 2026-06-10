# Discover Music

<img width="1661" height="2017" alt="Screenshot 2026-03-25 195731" src="https://github.com/user-attachments/assets/bc1a369f-8398-4d46-a1c5-92595321d50b" />

## Description

Discover Music is an AI-powered music discovery app that uses the OpenAI API and Spotify Web API to turn natural language prompts into real music matches. Users can search by mood, era, energy, and discovery level to find tracks that fit exactly what they want to hear.

## Features

- OpenAI API integration for structured music intent parsing
- Spotify Web API integration for real track search results
- Search by mood, era, energy, and discovery level
- Smart multi-query search flow for better music matching
- Clean glass-style UI
- Real Spotify embedded track previews

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express
- OpenAI API
- Spotify Web API

## Installation

1. Create a `.env` file inside the `server` folder and add the following:
   - `OPENAI_API_KEY`
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_MARKET`
   - `PORT`

2. In the `server` folder, install dependencies:
   - `npm install`

3. Start the server:
   - `npm run dev`

4. Open the frontend HTML file in the browser.

## Usage

Use Discover Music to search for music in plain English. Enter a mood, vibe, or listening scenario, choose a type, era, and discovery level, and the app will return Spotify matches based on your input.

Example prompts:
- dreamy electronic for a rainy night
- late 90s trip hop for after hours
- 2000s indie rock for a night drive
- uplifting pop for a sunny morning

## Future Improvements

- Add stronger rate limiting and anti-spam protection
- Add authentication for safer public deployment
- Improve ranking and recommendation quality further
- Add playlist generation
- Add Spotify login and user-personalized recommendations
- Deploy as a standalone production app

## License

This project is licensed under the MIT License.
