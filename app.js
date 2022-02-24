//import modules
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const https = require("https");
const http = require("http")
const { response } = require("express");
const { runInNewContext } = require("vm");

//initialize express application
const app = express();

//set ejs as templating engine
app.set("view engine", "ejs");

//show public as css route
app.use(express.static("public"));

//Initialize body parser for use
app.use(bodyParser.urlencoded({extended: true}));

//Create date ad time for the main screen
let date = new Date()

let formatted_time = date.toLocaleString('en-us', {
    hour: '2-digit', // numeric, 2-digit
    minute: '2-digit', // numeric, 2-digit
});
let formatted_date = date.toLocaleString('en-us', {
    weekday: 'long', // long, short, narrow
    day: 'numeric', // numeric, 2-digit
    year: 'numeric', // numeric, 2-digit
    month: 'long', // numeric, 2-digit, long, short, narrow
})

//Dummy starter hourly data for mobile view
const hourlyItemData = {
    icon: [0,0,0,0],
    tempMain: [0,0,0,0],
    tempFeelsLike: [0,0,0,0],
    humidity: [0,0,0,0],
    pressure: [0,0,0,0],
    wind: [0,0,0,0],
    description: [0,0,0,0],
    hour: [0,0,0,0],
    displayIcon: [0,0,0,0]
}

//default values passed when the "/" route is requested
const defaultValues = {
    time: formatted_time,
    date: formatted_date,
    location: "--",
    temperature_main: "--",
    hourlyData: hourlyItemData,
    temperature_feels_like: "--",
    humidity: "--",
    pressure: "--",
    wind: "--",
    weatherIcon: "--",
    description: "--"
}

//Main Screen/Homepage
app.get("/", (req, res) => {
    res.render("home", {
        time: defaultValues.time,
        date: defaultValues.date,
        location: defaultValues.location,
        temperature_main: defaultValues.temperature_main,
        temperature_feels_like: defaultValues.temperature_feels_like,
        humidity: defaultValues.humidity,
        pressure: defaultValues.pressure,
        wind: defaultValues.wind,
        weatherIcon: defaultValues.weatherIcon,
        description: defaultValues.description,
        hourlyData: defaultValues.hourlyData
    })
});

//Post request gotten from the search bar
app.post("/", (req, res) => {
    const query = req.body.location;
    const apiKey = "d527b6758c87d7dfaeb6e2044f266605";

    //API to get the latitude and longtitude of a location
    const latlonUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`

    //Parse API and assign the lat and lon of a location to their respective parameters
    https.get(latlonUrl, (response) => {
        response.on("data", (data) => {
            const latlonData = JSON.parse(data);
            if (latlonData.length < 1) {
                console.log("Wrong location");
                res.redirect("/")
            }
            else {
                const latitude = latlonData[0].lat;
                const longtitude = latlonData[0].lat
    
                //Pass the data gotten from the above API the data that parses the hourly data
                const hourlyUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longtitude}&units=metric&exclude=minutely,daily,alerts&appid=${apiKey}`
    
                https.get(hourlyUrl , (response) => {
    
                    //Initialize an object that holds empty arrays for the data needed in the mobile vies
                    const hourlyItemData = {
                        icon: [],
                        displayIcon: [],
                        tempMain: [],
                        tempFeelsLike: [],
                        humidity: [],
                        pressure: [],
                        wind: [],
                        description: [],
                        hour: []
                    }
    
                    response.on("data", (data) => {
                        const hourlyData = JSON.parse(data);
                        for (let i = 1; i < 5; i++) {
                            let now = date.getHours()
                            let hourly = now + i
                            
                            hourlyItemData.hour.push(hourly)
    
                            const iconData = hourlyData.hourly[hourly].weather[0].icon
                            switch (iconData) {
                                case "01d":
                                case "01n":
                                    hourlyItemData.displayIcon.push('clear sky');
                                    break;
                                case "02d": 
                                case "O2n":
                                    hourlyItemData.displayIcon.push('few clouds');
                                    break;
                                case "03d":
                                case "03n":
                                    hourlyItemData.displayIcon.push('scattered clouds');
                                    break;
                                case "04d":
                                case "04n":
                                    hourlyItemData.displayIcon.push("broken clouds");
                                    break;
                                case "09d":
                                case "09n":
                                    hourlyItemData.displayIcon.push('shower rain');
                                    break;
                                case "10d":
                                case "10n":
                                    hourlyItemData.displayIcon.push('rain');
                                    break;
                                case "11d":
                                case "11n":
                                    hourlyItemData.displayIcon.push('thunderstorm');
                                    break;
                                case "13d":
                                case "13n":
                                    hourlyItemData.displayIcon.push('snow');
                                    break;
                                case "50d":
                                case "50n":
                                    hourlyItemData.displayIcon.push('mist');
                                    break;
                                }
                            hourlyItemData.icon.push(iconData)
    
                            const tempMainData = hourlyData.hourly[hourly].temp
                            hourlyItemData.tempMain.push(tempMainData)
    
                            const tempFeelsLikeData = hourlyData.hourly[hourly].feels_like
                            hourlyItemData.tempFeelsLike.push(tempFeelsLikeData)
    
                            const humidityData = hourlyData.hourly[hourly].humidity
                            hourlyItemData.humidity.push(humidityData)
    
                            const pressureData = hourlyData.hourly[hourly].pressure
                            hourlyItemData.pressure.push(pressureData)
    
                            const windData = hourlyData.hourly[hourly].wind_speed
                            hourlyItemData.wind.push(windData)
    
                            const descriptionData = hourlyData.hourly[hourly].weather[0].description
                            hourlyItemData.description.push(descriptionData)
                        }
    
                        const icon = hourlyData.current.weather[0].icon;
                        const tempMain = hourlyData.current.temp;
                        const tempFeelsLike = hourlyData.current.feels_like;
                        const humidity = hourlyData.current.humidity;
                        const pressure = hourlyData.current.pressure;
                        const wind = hourlyData.current.wind_speed
                        const description = hourlyData.current.weather[0].description
                        
                        let displayIcon = ""
    
                        switch (icon) {
                            case "01d":
                            case "01n":
                                displayIcon = "clear sky"
                                break;
                            case "02d": 
                            case "O2n":
                                displayIcon = "few clouds";
                                break;
                            case "03d":
                            case "03n":
                                displayIcon = "scattered clouds";
                                break;
                            case "04d":
                            case "04n":
                                displayIcon = "broken clouds";
                                break;
                            case "09d":
                            case "09n":
                                displayIcon = "shower rain";
                                break;
                            case "10d":
                            case "10n":
                                displayIcon = "rain";
                                break;
                            case "11d":
                            case "11n":
                                displayIcon = "thunderstorm";
                                break;
                            case "13d":
                            case "13n":
                                displayIcon = "snow";
                                break;
                            case "50d":
                            case "50n":
                                displayIcon = "mist";
                                break;
                            }
            
    
                        res.render("home", {
                            time: defaultValues.time,
                            date: defaultValues.date,
                            location: query,
                            temperature_main: tempMain,
                            hourlyData: hourlyItemData,
                            temperature_feels_like: tempFeelsLike,
                            humidity: humidity,
                            pressure: pressure,
                            wind: wind,
                            weatherIcon: displayIcon,
                            description: description
                        })
    
                        hourlyItemData.icon.length = 0
                        hourlyItemData.tempMain.length = 0
                        hourlyItemData.tempFeelsLike.length = 0
                        hourlyItemData.humidity.length = 0
                        hourlyItemData.pressure.length = 0
                        hourlyItemData.wind.length = 0
                        hourlyItemData.description.length = 0
                        hourlyItemData.hour.length =0
                    })
                })
            }

        }) //<<
    })
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});