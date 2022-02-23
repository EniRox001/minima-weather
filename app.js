//import modules
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios")
const https = require("https");
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

app.get("/", (req, res) => {
    const location = "Australia"
    res.render("home", {location: location})
});

app.post("/", (req, res) => {
    const query = req.body.location
    const apiKey = "d527b6758c87d7dfaeb6e2044f266605"
    const unit = "metric"
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${unit}&appid=${apiKey}`

    https.get(url, (response) => {
        console.log(response.statusCode);

        response.on("data", (data) => {
            const weatherData = JSON.parse(data)
            const tempMain = weatherData.main.temp
            const tempFeelsLike = weatherData.main.feels_like
            const humidity = weatherData.main.humidity
            const pressure = weatherData.main.pressure
            const wind = weatherData.wind.speed

            res.render("home", {
                location: query,
                temperature: tempMain,
                tempFeelsLike: tempFeelsLike,
                humidity: humidity,
                pressure: pressure,
                wind: wind
            })
        })
    })
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});