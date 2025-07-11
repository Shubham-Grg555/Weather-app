//require('dotenv').config();
const weatherForm = document.querySelector(".weatherForm");
const errorContainer = document.querySelector('.errorMsgArea');

console.log(process.env.apiKey)

weatherForm.addEventListener("submit", async event => {
    event.preventDefault();

    let cityName = document.querySelector(".cityNameInput").value;
    console.log(cityName);
    if (cityName){
        try{
            const weatherData = await getWeatherData(cityName);
            displayWeatherData(weatherData);
        }
        catch(error){
            displayError(error);
        }
    }
    else{
        displayError("Please enter a city");
    }
});

async function getWeatherData(cityName){
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.apiKey}&mode=json&units=metric`;

    const response = await fetch(apiUrl);
    console.log(response.status);
    if (!response.ok){
        console.log("Does say not okay properly");
        displayError("Unable to fetch weather data");
        return;
    }
    return await response.json(); 
}

function displayWeatherData(data){
    if (errorContainer) {
        errorContainer.remove();
    }

    const {name: cityName,
            main: {temp, feels_like, temp_max, temp_min, humidity},
            weather: [{description, id}],
            timezone: timezone,
            visibility: visibility} = data;

    

    const weatherCard = document.querySelector(".weatherCard");
    weatherCard.style.display = "flex";
    weatherCard.textContent = "";

    const currentUTC = new Date();
    const localMillis = currentUTC.getTime() + (timezone * 1000);
    const localTime = new Date(localMillis);
    const hours = localTime.getHours();
    const formattedTime = localTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    });

    const gradientMap = {
        morning: "gradientMorning",
        afternoon: "gradientAfternoon",
        evening: "gradientEvening",
        night: "gradientNight"
    };

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

    weatherCard.classList.remove("gradientMorning", "gradientAfternoon",
                                "gradientEvening", "gradientNight");
    weatherCard.classList.add(gradientMap[timeOfDay]);


    weatherCard.innerHTML = `
    <h1>${cityName}</h1>
    <div class="flexRow">
        <h2>${temp}°C</h2>
        <p class="weatherEmoji">${getWeatherEmoji(id)}</p>
    </div>
    <p>Local time: ${formattedTime}</p>
    <p>Feels like: ${feels_like}°C</p>
    <p>Today's highest temperature: ${temp_max}°C</p>
    <p>Today's lowest temperature: ${temp_min}°C</p>
    <p>${description}</p>
    <p>Humidity: ${humidity}%</p>
    <p>Visibility: ${visibility}%</p>
    `;
    
    weatherCard.appendChild(weatherCard);
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

function displayError(message){
    // console log to show error message is fine, but nothing comes up
    // Think need to check whether weatherData is None to stop code
    // cus might be going through all the code, trying to unpack data
    // but wipes error cus that is auto thing as if there assumes
    // was able to unpack data, but code not checking properly

    // code to change
    // const weatherData = await getWeatherData(cityName);
    // displayWeatherData(weatherData);
    if (errorContainer) {
        errorContainer.remove();
    }


    errorContainer.style.display = "flex";
    errorContainer.innerHTML = '';

    const errorMsgDisplay = document.createElement('p');
    errorMsgDisplay.textContent = message;
    errorMsgDisplay.classList.add('errorMsgArea');

    errorContainer.appendChild(errorMsgDisplay);

    console.log(message);
}