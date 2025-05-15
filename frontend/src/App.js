import React, { useEffect, useState } from 'react';
import './App.css';
import { FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { MapContainer, TileLayer, LayersControl, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
import { useMap } from 'react-leaflet';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
});

function RecenterMap({ lat, lon }) {
  const map = useMap();

   useEffect(() => {
    
    map.flyTo([lat, lon], map.getZoom(), { duration: 1.5 });
  }, [lat, lon, map]);

  return null;
}


function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDayIndex, setSelectedDayIndex]=useState(null);
  const [coords, setCoords] = useState({ lat: 20.5937, lon: 78.9629 });
  const [cloudOpacity, setCloudOpacity]= useState(0.5);
  const [precipitationOpacity, setPrecipitationOpacity]= useState(0.8);
  const [temperatureOpacity, setTemperatureOpacity] = useState(0.2);
  const [windOpacity, setWindOpacity] = useState(0.5);
 
  


  const apiKey = 'ad505593a4764c2b750b5b25ca804acb';

  const getWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError('');
    setWeather(null);
    setSelectedDayIndex(null);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${BACKEND_URL}/weather?city=${encodeURIComponent(city)}`);

      const data = await res.json();
      console.log("Raw API response:", data);

      if (res.ok) {
        setWeather(data);
        if (data.lat && data.lon){
          setCoords({lat:Number(data.lat),lon:Number(data.lon)});
          console.log("Updated coords from API:", data.lat, data.lon);
        }
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
        <button onClick={getWeather} title="Get Weather"
        as={motion.button}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        >
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
        <div className="weather-map">
          <h3>Live Weather Radar</h3>
          <div
  style={{
    padding: '15px 0',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
  }}
>
  {[
    { label: '🌧️ Precipitation Opacity', value: precipitationOpacity, setter: setPrecipitationOpacity },
    { label: '☁️ Cloud Opacity', value: cloudOpacity, setter: setCloudOpacity },
    { label: '🌡️ Temperature Opacity', value: temperatureOpacity, setter: setTemperatureOpacity },
    { label: '🌬️ Wind Opacity', value: windOpacity, setter: setWindOpacity },
  ].map(({ label, value, setter }) => (
    <div key={label} style={{ minWidth: 160, textAlign: 'center' }}>
      <Typography variant="body2" gutterBottom>
        {label}
      </Typography>
      <Slider
        value={value}
        onChange={(_, val) => setter(val)}
        min={0}
        max={1}
        step={0.1}
        sx={{
          color: '#1976d2', // MUI primary blue color for slider thumb & track
          '& .MuiSlider-thumb': {
            boxShadow: '0 0 8px rgba(25, 118, 210, 0.6)',
          },
        }}
      />
    </div>
  ))}
</div>



          <MapContainer
            key={`${coords.lat}-${coords.lon}`} 
            center={[coords.lat, coords.lon]}
            zoom={6}
            style={{ height: '400px', width: '100%' }}
          >
           <RecenterMap lat={coords.lat} lon={coords.lon}/>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Map">
                <>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles © Esri"
                />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles © Esri — Source: Esri, HERE, Garmin, © OpenStreetMap contributors'
                />
                </>
              </LayersControl.BaseLayer>
              <LayersControl.Overlay checked name="Precipitation">
                <TileLayer
                  url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`}
                  opacity={precipitationOpacity}
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay checked name="Clouds">
                
                <TileLayer
                  url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`}
                  opacity={cloudOpacity}
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay checked name="Temperature">
                <TileLayer
                  url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`}
                  opacity={temperatureOpacity}
                />
              </LayersControl.Overlay>

              <LayersControl.Overlay checked name="Wind">
                <TileLayer
                  url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`}
                  opacity={windOpacity}
                />
              </LayersControl.Overlay>
            </LayersControl>
            <Marker position={[coords.lat, coords.lon]} icon={L.icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}>
             <Popup>{weather?.city || "City"}</Popup>
            </Marker>
          </MapContainer>
        </div> 
        {weather && weather.daily && (
          <div className="daily-forecast">
            <h3>7 Day Forecast</h3>
            <LayoutGroup>
            <div className="daily-list">
              {weather.daily.map((day,index)=>(
                <motion.div 
                layout
                layoutId={`day-${index}`}
                className={`day-block ${selectedDayIndex === index ? 'selected' : ''}`}
                 key={index}
                  onClick={() =>
                    setSelectedDayIndex(selectedDayIndex === index ? null : index)
                  }
                  
                  animate={{
                    
                    zIndex: selectedDayIndex === index ? 10 : 1,
                    scale: selectedDayIndex === index ? 1.05 : 1 ,
                    boxShadow: selectedDayIndex === index
                       ? '0 12px 25px rgba(0, 0, 0, 0.2)'
                       : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                  transition={{ layout: { duration: 0.4, type: 'spring', bounce: 0.25, stiffness:120, damping: 20 } }}
                >
                  <p><strong>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong></p>
                  <img src={day.icon} alt={day.condition}/>
                  <p>{day.condition}</p>
                  <p>🌡️ {day.min_temp}°C - {day.max_temp}°C</p>
                  <p>💧 {day.humidity}% • 🌧️ {day.chance_of_rain}%</p>
                  <p>🌬️ {day.wind_kph} km/h</p>
                  
                  <AnimatePresence initial={false}>
                    {selectedDayIndex===index &&(
                      <motion.div
                      className="hourly-inside-day"
                      key="hourly"
                      initial={{height:0,opacity:0}}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      >
                        {day.hourly
                          .filter((hour) => {
                          const now = new Date();
                          const hourTime = new Date(hour.time);
                          return hourTime.getHours() >= now.getHours() || hourTime.getDate() > now.getDate();
                        })
                       .map((hour, i) => (
                        <div className="hour-block" key={i}>
                           <p><strong>{hour.time.split(' ')[1]}</strong></p>
                           <img src={hour.icon} alt={hour.condition} />
                           <p>{hour.temp_c}°C</p>
                           <p>{hour.condition}</p>
                           <p>💧 {hour.humidity}%</p>
                           <p>🌧️ {hour.chance_of_rain}%</p>
                          </div>
                        ))}

                      </motion.div>

                    )}
                  </AnimatePresence>
                </motion.div> 
              ))}
            </div>
            </LayoutGroup>
          </div>
        )}   
           
          
      </div>
    </div>
  );
}

export default App;
