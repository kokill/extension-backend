require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

//EXPRESS and MIDDLEWARE
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
const port = process.env.PORT || 8000;

//ROUTES
const panchangRoute = require("./panchang");
const fifaRoute = require("./fifa");
app.use("/panchang", panchangRoute);
app.use("/fifa", fifaRoute);

app.listen(port, () => {
  console.log("Server running on " + port);
});