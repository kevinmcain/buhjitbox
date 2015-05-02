var express = require('express');
var app = express();
var mongoose = require('mongoose');
var db = mongoose.connection;

//serve static images for the app from the 'images' directory
app.use('/images', express.static(__dirname + '/images'));
//serve static images for the app from the 'application_pages' directory in the app dir
app.use(express.static(__dirname + '/application_pages/'));

if('development' == app.get('env')) {
	
	mongoose.connect('mongodb://127.0.0.1/budgy');
}

var envelopeSchema = mongoose.Schema({
	_id: Object,
	bid: String,
	cid: String,
	category: String,
	amount: String,
	spent: String,
	balance: String
});

// specify modelName, schemaObject, collectionName
var envelopeModel = 
	mongoose.model('envelopeModel', envelopeSchema, 'envelope');

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function (callback) {
  	console.log('opened mongo connection');
});

app.get('/envelopes/:budgetId', function (req, res) {
	
	var budgetId = req.params.budgetId;
	
	console.log('requested bid: %s', budgetId);
	
	// query for envelopes given the budget id parameter
	envelopeModel.find({bid: budgetId}, function(err, envelopes) {
		res.send(envelopes);
	});
	
});

app.listen(80);