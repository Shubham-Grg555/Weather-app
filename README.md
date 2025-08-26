# Weather app
Simple weather app to get the weather of a city, try it [here](https://weather-app-2lcp.onrender.com).

##### NOTE:
1) Using the free tier of render to host the weather app, meaning the backend
spins down due to inactivity. According to render this can delay requests by
around 50 seconds or more, so please be patient on the first use, as once the
backend has been spun up, it becomes much faster to use.
1) To stay within the free tier of api calls, you can do a maximum of 500
weather requests total, meaning you will get an error if there have been
more than 500 requests in one day, or the hourly limit of 60 requests
has been hit. The reset time for these requests occurs at 12 am UTC.

## Features
- Able to get the weather of a city with other pieces of information.
- Nice minimalistic UI design that changes colour depending on the time of day.
- Weather forecast for the day to see how temperatures change during the day.

## License
This project is licensed under the [MIT License](LICENSE).
