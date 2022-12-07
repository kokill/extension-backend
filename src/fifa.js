const router = require("express").Router();
const qs = require("qs");
const axios = require("axios");
const { createClient } = require("redis");

const client = createClient();
client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", function () {
  console.log("Redis Connected!");
});
client.connect();

router.get("/", async (req, res) => {
  const fromDate = req.body.from;
  const toDate = req.body.to;
  const key = "fifa:" + fromDate + ":" + toDate;

  try {
    let result = await client.get(key);
    if (!result) {
      result = await fetchFifa(fromDate, toDate);
      client.set(key, JSON.stringify(result));
    }
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

const fetchFifa = (fromDate, toDate) => {
  console.log("Making fifa request");
  return axios
    .get(
      `https://api.fifa.com/api/v3/calendar/matches?from=${fromDate}T00%3A00%3A00Z&to=${toDate}T23%3A59%3A59Z&language=en&count=500&idSeason=255711`
    )
    .then((res) => res.data)
    .catch((err) => err);
};

module.exports = router;