//import modules
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios")
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

const defaultValues = {
    location: "--",
    temperature_main: "--",
    temperature_feels_like: "--",
    humidity: "--",
    pressure: "--",
    wind: "--",
    weatherIcon: "--",
    description: "--"
}

app.get("/", (req, res) => {
    res.render("home", {
        location: defaultValues.location,
        temperature_main: defaultValues.temperature_main,
        temperature_feels_like: defaultValues.temperature_feels_like,
        humidity: defaultValues.humidity,
        pressure: defaultValues.pressure,
        wind: defaultValues.wind,
        weatherIcon: defaultValues.weatherIcon,
        description: defaultValues.description
    })
});

app.post("/", (req, res) => {
    const query = req.body.location;
    const apiKey = "d527b6758c87d7dfaeb6e2044f266605";
    const unit = "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${unit}&appid=${apiKey}`;
    const latlonUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`

    https.get(latlonUrl, (response) => {
        response.on("data", (data) => {
            const latlonData = JSON.parse(data);
            const latitude = latlonData[0].lat;
            const longtitude = latlonData[0].lat

            const hourlyUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longtitude}&units=metric&exclude=minutely,daily,alerts&appid=${apiKey}`

            https.get(hourlyUrl , (response) => {
                response.on("data", (data) => {
                    const hourlyData = JSON.parse(data);
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
                        case "15d":
                        case "15n":
                            displayIcon = "mist";
                            break;
                        }
        

                    res.render("home", {
                        location: query,
                        temperature_main: tempMain,
                        temperature_feels_like: tempFeelsLike,
                        humidity: humidity,
                        pressure: pressure,
                        wind: wind,
                        weatherIcon: displayIcon,
                        description: description
                    })
                })
            })
        })
    })
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});