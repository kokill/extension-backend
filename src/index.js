const express = require('express');
const axios = require('axios');
const { createClient }  = require('redis');

const app = express();
const port = process.env.PORT || 8000;

const client = createClient();

let lastFifaResult = null;

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', function() {
  console.log('Redis Connected!');
});
client.connect();

const getFifa = () => {
    console.log("Making request");
	return axios.get("https://api.fifa.com/api/v3/calendar/matches?from=2022-11-25T00%3A00%3A00Z&to=2022-11-25T23%3A59%3A59Z&language=en&count=500&idSeason=255711")
	.then(resp => resp.data)
	.catch(err => err)
}

app.get('/fifa', async (req, resp) => {
	const fromDate = "";
	const toDate = "";
	const idSeason = "";
	const key = "fifa"+":"+fromDate+":"+toDate+ ":"+idSeason;
	const result = await client.get(key);
	if(!result) {
	  const fifa = await getFifa();
	  client.set(key, JSON.stringify(fifa));
	  resp.status(200).send(fifa);
	} else {
    	  resp.status(200).send(result);
	}
});

app.listen(port, () => {
	console.log("Server running on "+ port);
});
