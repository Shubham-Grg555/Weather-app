const backendUrlCoords = import.meta.env.VITE_BACKEND_URL_COORDS;
const backendUrlApiCallsInfo = import.meta.env.VITE_BACKEND_URL_API_CALLS_INFO;
const apiKey = import.meta.env.VITE_API_KEY;

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const weatherCard = document.querySelector(".weatherCard");
const weatherForm = document.querySelector(".weatherForm");

weatherForm.addEventListener("submit", async event => {
  event.preventDefault();
  let cityName = document.getElementById("cityNameInput").value;
  cityName = cityName.toLowerCase()

  const isWithinLimit = await checkWithinApiCallsLimit();

  if (cityName && isWithinLimit){
    try{
      const coordsResult = await checkAndGetCoordsInDb(cityName);
    if (coordsResult) {
      const { lat, lon } = coordsResult;
      const weatherData = await getWeatherData(lat, lon);
      const forecastData = await getForecastData(lat, lon);
      await updateApiCallsInfo();
      displayWeatherData(cityName, weatherData, forecastData);
    } else {
        const { latitude: lat, longitude: lon } = await getCoords(cityName);
        await storeCoordsInDb(cityName, lat, lon);
        const weatherData = await getWeatherData(lat, lon);
        const forecastData = await getForecastData(lat, lon);
        await updateApiCallsInfo();
        displayWeatherData(cityName, weatherData, forecastData);
    }
  }
  catch(error){
    window.alert(error);
    }
  }
});

async function checkWithinApiCallsLimit(){
  const apiCallsInfoResponse = await fetch(backendUrlApiCallsInfo);
  const data = await apiCallsInfoResponse.json();

  if (apiCallsInfoResponse.status === 429) {
    const now = new Date();
    const resetTime = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1, // next day
      0, 0, 0, 0 // 12:00 AM UTC
    ));
    
    // time format is: 'YYYY-MM-DD HH:mm'
    const formattedTime = resetTime.toISOString().replace('T', ' ').slice(0, 16);
    window.alert("Rate limit exceeded, please try again after the limit is refreshed at: " + 
      formattedTime + " UTC.");
    return false;
  }

  if (!apiCallsInfoResponse.ok) {
    window.alert("Unexpected error: " + apiCallsInfoResponse.status + " please try again later.");
    return false;
  }

  return true;
}

async function getCoords(cityName){
  const geoCoordsUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`;
  const geoResults = await fetch(geoCoordsUrl);

  if (!geoResults.ok){
    throw new Error("Error fetching the coordinates of the city, please try again later.");
  }

  const geoData = await geoResults.json();
  // Means did not get any results because city does not exist
  if (!Array.isArray(geoData.results)){
    throw new Error("City does not exist, ensure the city exists and was spelt correctly.");
  }

  return geoData.results[0];
}

async function checkAndGetCoordsInDb(cityName){
  const fullBackendUrl = backendUrlCoords + `/${cityName}`
  const coordsResponse = await fetch(fullBackendUrl);
  const coords = await coordsResponse.json();

  if (!coordsResponse.ok){
    throw new Error("Could not check the database to see if the coords are "
      + "there, please try getting the weather again later.");
  }

  if (!coords){
    return null;
  }

  return { lat: coords.lat, lon: coords.lon };
}

async function storeCoordsInDb(cityName, lat, lon){
  const response = await fetch(backendUrlCoords, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ cityName, lat, lon })
    });
    
  if (!response.ok){
    return new Error("Could not store city and coords into the database.");
  }
}

async function getWeatherData(lat, lon) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&mode=json&units=metric`;
  
  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok){
    throw new Error("Could not fetch the weather data of the city, please try again later.");
  }
  const weatherData = await weatherResponse.json();
  return weatherData;
}

async function getForecastData(lat, lon) {
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=auto`;
  const forecastResponse = await fetch(forecastUrl);

  if (!forecastResponse.ok){
    throw new Error("Could not fetch the forecast data of the city, please try again later.");
  }
  const forecastData = await forecastResponse.json();
  return forecastData;
}

async function updateApiCallsInfo(){
  const apiCallsInfoResponse = await fetch(backendUrlApiCallsInfo, {
    method: 'PUT',
  });

  if (!apiCallsInfoResponse.ok){
      throw new Error("Could not update the api calls limit, please try getting the weather again later.");
  }
}

function displayWeatherData(cityName, weatherData, forecastData){
  const {
    weather: [{description, id: weatherId}],
    main: {
      temp: temperature,
      feels_like: feelsLike,
      pressure,
      humidity},
    visibility: visibility,
    wind: {
      speed: windSpeed,
      deg: windDegrees,
    },
    clouds: {all: cloudCoverage},
  } = weatherData;

  const {
      hourly: {
      temperature_2m: temperatureForecast,
      time: dateAndTimeForForecast
      },
      timezone: timeZone
  } = forecastData;

  weatherCard.style.display = "flex";
  weatherCard.textContent = "";

  const formattedCityName = toPascalCase(cityName);
  const formattedTime = getTime(timeZone);
  applyTimeThemeToCard(formattedTime);

  weatherCard.innerHTML = `
  <div class="headerRow">
    <span class="cityName">${formattedCityName}</span>
    <span>${temperature}°C ${getWeatherEmoji(weatherId)}</span>
  </div>
  <p>Description: ${description}. With a cloud coverage of: ${cloudCoverage}%</p>
  <p>Feels like: ${feelsLike}°C</p>
  <p>Local time (24 hour clock): ${formattedTime}</p>
  <p>Wind speed: ${windSpeed}m/s</p>
  <p>Wind direct: ${getCompassDirection(windDegrees)} (${windDegrees}°)</p>
  <p>Pressure: ${pressure}hPa</p>
  <p>Humidity: ${humidity}%</p>
  <p>Visibility: ${visibility / 1000}km</p>
  <p>Forecast:</p>
  `;

  displayChart(dateAndTimeForForecast, temperatureForecast);
}

function toPascalCase(cityName) {
  return cityName
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function getTime(timeZone){
  const currentUTC = new Date();
  const formattedTime = currentUTC.toLocaleTimeString( "en-GB", {
  timeZone,
  hour: "2-digit",
  minute: "2-digit",
  });

  return formattedTime;
}

function applyTimeThemeToCard(formattedTime){
  // Time is always HH:MM, so hours can be read from the first 2 chars
  const hours = formattedTime.substring(0,2);
    let timeOfDay;
  if (hours >= 6 && hours < 12) {
      timeOfDay = "morning";
  } else if (hours >= 12 && hours < 18) {
      timeOfDay = "afternoon";
  } else if (hours >= 18 && hours < 21) {
      timeOfDay = "evening";
  } else {
      timeOfDay = "night";
  }

  const gradientMap = {
    morning: "gradientMorning",
    afternoon: "gradientAfternoon",
    evening: "gradientEvening",
    night: "gradientNight"
  };

  weatherCard.classList.remove("gradientMorning", "gradientAfternoon",
                              "gradientEvening", "gradientNight");
  weatherCard.classList.add(gradientMap[timeOfDay]);
}

function getCompassDirection(windDegrees) {
  const directions = [
    "North",
    "North-East",
    "East",
    "South-East",
    "South",
    "South-West",
    "West",
    "North-West"
  ];

  // formula to get the compass direction of the wind from wind degrees
  const index = Math.round(windDegrees / 45) % 8;
  return directions[index];
}

function getWeatherEmoji(weatherId){
  switch(true){
      case (weatherId >= 200 && weatherId < 300):
          return "⛈️";
      case (weatherId >= 300 && weatherId < 400):
          return "🌧️";
      case (weatherId >= 500 && weatherId < 600):
          return "🌧️";
      case (weatherId >= 600 && weatherId < 700):
          return "🌨️";
      case (weatherId >= 700 && weatherId < 800):
          return "🌫️";
      case (weatherId === 800):
          return "☀️";
      case (weatherId >= 801 && weatherId < 809):
          return "☁️";
      default:
          return "Unknown weather type";
  }
}

function displayChart(times, temperatures){
  const dateAndTime24hrs = times.slice(0, 24);
  const labels = dateAndTime24hrs.map(t => t.split("T")[1]);
  const temps = temperatures.slice(0, 24);
  const lowestTemp = Math.round(Math.min(...temps) - 5);
  const highestTemp = Math.round(Math.max(...temps) + 5);
  
  // forecast always 
  const yAxisStartPoint = lowestTemp % 2 ? lowestTemp - 1 : lowestTemp;
  const yAxisEndPoint = highestTemp % 2 ? highestTemp + 1 : highestTemp;

  // checking for old chart and removing it
  const temperatureChartCheck = document.getElementById("temperatureChart");
  if (temperatureChartCheck) {
    temperatureChartCheck.remove();
  }

  const temperatureChart = document.createElement("canvas");
  temperatureChart.id = "temperatureChart";
  weatherCard.appendChild(temperatureChart);
  const ctx = temperatureChart.getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Hourly Temperature (°C)",
        data: temps,
        borderColor: "white",
        tension: 0.35
      }]
    },
    options: {
      scales: {
        x: {
          ticks: {
            color: "white",
            maxTicksLimit: 8
          },
          grid: {
            color: "rgba(255,255,255,0.2)"
          }
        },
        y: {
          ticks: {
            color: "white",
            stepSize: 2
          },
          grid: {
            color: "rgba(255,255,255,0.2)"
          },
          min: yAxisStartPoint,
          max: highestTemp
        }
      }
    }
  });
}