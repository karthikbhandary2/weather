import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

function WeatherCanvas({ weatherType }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor(type) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.type = type;
        
        if (type === 'rain') {
          this.speed = 8 + Math.random() * 4;
          this.length = 15 + Math.random() * 10;
          this.opacity = 0.3 + Math.random() * 0.4;
        } else if (type === 'snow') {
          this.speed = 1 + Math.random() * 2;
          this.radius = 2 + Math.random() * 3;
          this.opacity = 0.6 + Math.random() * 0.4;
          this.drift = Math.random() * 2 - 1;
        } else if (type === 'cloud') {
          this.speed = 0.5 + Math.random() * 0.5;
          this.radius = 30 + Math.random() * 40;
          this.opacity = 0.3 + Math.random() * 0.2;
        }
      }

      update() {
        this.y += this.speed;
        if (this.type === 'snow') this.x += this.drift;
        else if (this.type === 'cloud') this.x += this.speed;

        if (this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
        }
        if (this.type === 'cloud' && this.x > canvas.width + this.radius) {
          this.x = -this.radius;
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (this.type === 'rain') {
          ctx.strokeStyle = '#4A90E2';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x, this.y + this.length);
          ctx.stroke();
        } else if (this.type === 'snow') {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 'cloud') {
          ctx.fillStyle = '#B0B0B0';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.arc(this.x + this.radius * 0.6, this.y, this.radius * 0.8, 0, Math.PI * 2);
          ctx.arc(this.x + this.radius * 1.2, this.y, this.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    let type = 'cloud';
    let count = 15;
    
    if (weatherType?.includes('rain') || weatherType?.includes('drizzle')) {
      type = 'rain';
      count = 150;
    } else if (weatherType?.includes('snow')) {
      type = 'snow';
      count = 100;
    } else if (weatherType?.includes('cloud')) {
      type = 'cloud';
      count = 15;
    }

    particlesRef.current = Array.from({ length: count }, () => new Particle(type));

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationId);
  }, [weatherType]);

  return <canvas ref={canvasRef} className="weather-canvas" />;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.county;
        if (city) onMapClick(city);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }
  });
  return null;
}

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  const fetchWeather = async (cityName) => {
    try {
      const response = await fetch(`http://localhost:3333/${cityName}`);
      const data = await response.json();
      
      if (data.cod === 200) {
        setWeather(data);
        setMapCenter([data.coord.lat, data.coord.lon]);
        setMapZoom(10);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      alert('Failed to fetch weather data');
    }
  };

  const handleSearch = () => {
    if (city.trim()) fetchWeather(city);
  };

  return (
    <>
      <div className="search-container">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for a city..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <MapContainer center={mapCenter} zoom={mapZoom} className="map-container" key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onMapClick={fetchWeather} />
        {weather && (
          <Marker position={[weather.coord.lat, weather.coord.lon]}>
            <Popup>
              <b>{weather.name}</b><br />
              {weather.weather[0].description}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {weather && (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <p>Temperature: {(weather.main.temp - 273.15).toFixed(1)}°C</p>
          <p>Weather: {weather.weather[0].description}</p>
          <p>Humidity: {weather.main.humidity}%</p>
        </div>
      )}

      <WeatherCanvas weatherType={weather?.weather[0].main.toLowerCase()} />
    </>
  );
}

export default App;
