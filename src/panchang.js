const router = require("express").Router();
const qs = require("qs");
const axios = require("axios");
const { DateTime } = require("luxon");
const { createClient } = require("redis");

const client = createClient();
client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", function () {
  console.log("Redis Connected!");
});
client.connect();

router.get("/", async (req, res) => {
    const dt = DateTime.now();
    let dateTimeString = dt.toISO();
    dateTimeString = dateTimeString.replace("+", "%2B");
    const key = dateTimeString.split("T")[0];
  
    try {
      let result = await client.get(key);
      if (!result) {
        const accessToken = await fetchAccessToken();
        const panchangTable = await fetchPanchangTable(
          accessToken,
          dateTimeString
        );
        result = panchangTable.data;
        client.set(key, JSON.stringify(result));
      }
      res.status(200).send(result);
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  });

const fetchAccessToken = async () => {
    let data = qs.stringify({
      grant_type: "client_credentials",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    });
    let config = {
      method: "post",
      url: "https://api.prokerala.com/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    return axios(config)
      .then((response) => response.data.access_token)
      .catch(function (error) {
        console.log(error);
      });
  };

  const fetchPanchangTable = async (accessToken, dateTimeString) => {
    const coordN = "12.9716";
    const coordE = "77.5946";
    var config = {
      method: "get",
      url: `https://api.prokerala.com/v2/astrology/panchang?ayanamsa=1&coordinates=${coordN},${coordE}&datetime=${dateTimeString}`,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    };

    return axios(config)
      .then((response) => response.data)
      .catch(function (error) {
        console.log(error);
      });
  };

module.exports = router;