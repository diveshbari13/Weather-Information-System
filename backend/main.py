from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import requests
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

API_KEY = "e4fa4adb2b1948d88cb110938251105"
BASE_CURRENT_URL = "http://api.weatherapi.com/v1/current.json"
BASE_ASTRONOMY_URL = "http://api.weatherapi.com/v1/astronomy.json"
BASE_FORECAST_URL = "http://api.weatherapi.com/v1/forecast.json"

@app.get("/")
def read_root():
    return FileResponse("static/index.html")

@app.get("/weather")
def get_weather(city: str):
    now=datetime.now()

    current_params = {
        "key": API_KEY,
        "q": city
    }
    current_response = requests.get(BASE_CURRENT_URL, params=current_params)
    if current_response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching current weather data")
    current_data = current_response.json()
    current = current_data["current"]
    location = current_data["location"]


    # Get astronomy data
    astronomy_params = {
        "key": API_KEY,
        "q": city,
        "dt": datetime.now().strftime("%Y-%m-%d")
    }
    astronomy_response = requests.get(BASE_ASTRONOMY_URL, params=astronomy_params)
    if astronomy_response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching astronomy data")
    astronomy_data = astronomy_response.json()
    astro = astronomy_data["astronomy"]["astro"]

    # Get forecast data (for rainfall)
    forecast_params = {
        "key": API_KEY,
        "q": city,
        "days": 7,
        "aqi": "no",
        "alerts": "no"
    }
    forecast_response = requests.get(BASE_FORECAST_URL, params=forecast_params)
    if forecast_response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching forecast data")
    forecast_data = forecast_response.json()
    forecast_day = forecast_data["forecast"]["forecastday"][0]["day"]
    hourly_data= forecast_data["forecast"]["forecastday"][0]["hour"]

    current_hour=now.hour
    start_hour=max(0,current_hour-2)
    end_hour=min(len(hourly_data),current_hour+4)
    sliced_hourly=hourly_data[start_hour:end_hour]

    daily_forecast = [
        {
            "date": day["date"],
            "min_temp": day["day"]["mintemp_c"],
            "max_temp": day["day"]["maxtemp_c"],
            "condition": day["day"]["condition"]["text"],
            "icon": day["day"]["condition"]["icon"],
            "humidity": day["day"]["avghumidity"],
            "chance_of_rain": day["day"].get("daily_chance_of_rain", 0),
            "wind_kph": day["day"]["maxwind_kph"],
            "hourly":[
            {
                "time": hour["time"],
                "temp_c": hour["temp_c"],
                "condition": hour["condition"]["text"],
                "icon": hour["condition"]["icon"],
                "humidity": hour["humidity"],
                "chance_of_rain": hour.get("chance_of_rain", 0),
                "is_current": (hour["time"].split(" ")[1][:2] == str(now.hour).zfill(2))
            }
            for hour in day["hour"]
        ]
        }
        for day in forecast_data["forecast"]["forecastday"]
    ]

    result = {
        "city": location["name"],
        "lat": location["lat"],
        "lon": location["lon"],
        "temperature": f"{current['temp_c']}°C",
        "humidity": f"{current['humidity']}%",
        "pressure": f"{current['pressure_mb']} hPa",
        "condition": current["condition"]["text"],
        "uv_index": current["uv"],
        "sunrise": astro["sunrise"],
        "sunset": astro["sunset"],
        "rainfall": f"{forecast_day['totalprecip_mm']} mm",
        "chance_of_rain": f"{forecast_day['daily_chance_of_rain']}%",
        "daily": daily_forecast
    }

    return result
