# Weather Map Application

Interactive weather map application with real-time weather data and animated weather effects.

## Features

- 🗺️ Interactive world map with click-to-search
- 🔍 City search functionality
- 🌧️ Weather-based animations (rain, snow, clouds)
- 🌡️ Real-time temperature and weather information
- 📍 Auto-geolocation support

## Tech Stack

**Backend:**
- Go
- OpenWeatherMap API
- Geolocation API

**Frontend:**
- React
- Leaflet (React Leaflet)
- Canvas API for animations
- Vite

## Setup

### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Add your OpenWeatherMap API key to `.env`:
```
OPENWEATHER_API_KEY=your_api_key_here
```

4. Run the server:
```bash
OPENWEATHER_API_KEY=your_api_key_here go run main.go
```

Server runs on `http://localhost:3333`

### Frontend

1. Navigate to frontend directory:
```bash
cd frontend-react
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Usage

1. Start the backend server first
2. Start the frontend development server
3. Open your browser to `http://localhost:5173`
4. Search for a city or click anywhere on the map to get weather information

## API Key

Get your free API key from [OpenWeatherMap](https://openweathermap.org/api)

## License

MIT
