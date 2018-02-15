
const bodyParser = require('body-parser');
const express = require('express');
const fetch = require('node-fetch');
const config = require('./config');

const STATUS_USER_ERROR = 422;

const server = express();
server.use(bodyParser.json());

const port = config.port;
const key = config.gmap.apiKey;
let query = 'restaurants+in+austin';

const searchURL = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${key}`;
fetch(searchURL).then(res => res.json()).then(json => results = json.results);

let results = [];
let result = {};

let shortResults = () => {
	results = results.map(result => {
		return {
			name: result.name,
			place_id: result.place_id,
			types: result.types
		}
	});
};

let shortResult = (place) => {
	const newResult = {
			name: place.name,
			address: place.formatted_address,
			phone_number: place.formatted_phone_number,
			rating: place.rating,
			types: place.types,
			hours: place.opening_hours
		};
	return newResult;
}


server.get('/places/:query', (req, res) => {
	query = req.params.query;
	shortResults();
	if (!results) {
		res.status(STATUS_USER_ERROR);
		res.json({error: 'Unable to get place data.'})
	}
	res.json(results);
});

server.get('/place', (req, res) => {
	shortResults();
	const id = results[0].place_id;
	const detailURL = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${id}&key=${key}`;
	fetch(detailURL).then(res => res.json()).then(json => result = json.result);
	const newResult = shortResult(result);
	if (!result) {
		res.status(STATUS_USER_ERROR);
		res.json({error: 'Unable to get place data.'});
	}
	res.send(newResult);
});

server.listen(port, err => {
	if (err) {
		console.log(`Error starting server at port ${port}`);
	} else {
		console.log(`server listening on port ${port}`);
	}
});


