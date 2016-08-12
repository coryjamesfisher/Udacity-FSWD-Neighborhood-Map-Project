var express = require('express');
var router = express.Router();
var Twitter = require('twitter');

/* GET home page. */
router.get('/api/location/tweets', function(req, res, next) {

	res.set('Access-Control-Allow-Origin', '*');
	 
	var client = new Twitter({
	  consumer_key: 'cRqA5ap8wbjgijsXwY8EgNimN',
	  consumer_secret: '9OcDBzhnnWqYWOdWl9p5F9qbCic4SaKvx3hlMPX691i7iaFnnK',
	  access_token_key: '438019079-gbEBOz44AS1u7ol38RcDhP64ntzQvb26h8vRrVwG',
	  access_token_secret: 'sdVTXsmhEeaH0qvvk96pHrBBRoW9MQZXNy73ZxVH2AJzX'
	});

	if (typeof req.query.location === 'undefined' || req.query.location.length === 0) {
		res.status(400).json({'error': 'Please name a location to retrieve tweets.'});
		return;
	}
	 
	var params = {q: req.query.location, geocode: req.query.lat + ',' + req.query.lon + ',5mi'};
	client.get('search/tweets.json', params, function(error, tweets, response) {
	  if (!error) {
		res.status(200).json(tweets);
	  } else {
		res.status(500).json({'error': 'Failed to fetch tweets from the Twitter API for location: ' + req.query.location + '.'});
          }
	});

});

module.exports = router;
