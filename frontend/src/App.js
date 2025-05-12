import React, { useState } from 'react';
import './App.css';
import { FaSearch } from 'react-icons/fa';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${BACKEND_URL}/weather?city=${encodeURIComponent(city)}`);

      const data = await res.json();

      if (res.ok) {
        setWeather(data);
      } else {
        setError(data.detail || 'Error fetching data');
      }
    } catch (err) {
      setError('Network error');
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="sidebar">
      <h1>🌤️ Weather App</h1>
      <div className="search-bar">
        <input 
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e)=>setCity(e.target.value)}
        />
        <button onClick={getWeather} title="Get Weather">
          <FaSearch/>
        </button>
      </div>
     

      {loading && (
        <div className="spinner">
          <div className="loader"></div>
        </div>
      )}
      <div className="result">
         {error && <p className="error">{error}</p>}
          {weather && (
            <>
      <h3>General Information</h3>
      <div className="section">
        <p><strong>City:</strong> {weather.city}</p>
        <p><strong>Temperature:</strong> {weather.temperature}</p>
        <p><strong>Condition:</strong> {weather.condition}</p>
      </div>

      <h3>Atmospheric Conditions</h3>
      <div className="section">
        <p><strong>Humidity:</strong> {weather.humidity}</p>
        <p><strong>Pressure:</strong> {weather.pressure}</p>
        <p><strong>UV Index:</strong> {weather.uv_index}</p>
      </div>

      <h3>Sun & Rain Info</h3>
      <div className="section">
        <p><strong>Sunrise:</strong> {weather.sunrise}</p>
        <p><strong>Sunset:</strong> {weather.sunset}</p>
        <p><strong>Rainfall:</strong> {weather.rainfall}</p>
        <p><strong>Chance of Rain:</strong> {weather.chance_of_rain}</p>
      </div>
    </>
          )}
      </div>
      </div>

       <div className="main-content">
        {/* Here you can place the hourly forecast or other content */}
        {weather && weather.hourly && (
          <div className="hourly">
            
            <div className="hourly-list">
              {weather.hourly.map((hour, index) => (
                <div  className={`hour-block ${hour.is_current ? 'current-hour' : ''}`}key={index}>
                  <p><strong>{hour.time.split(' ')[1]}</strong></p>
                  <img src={hour.icon} alt={hour.condition} />
                  <p>{hour.temp_c}°C</p>
                  <p>{hour.condition}</p>
                  <p>💧 {hour.humidity}%</p>
                  <p>🌧️ {hour.chance_of_rain}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
