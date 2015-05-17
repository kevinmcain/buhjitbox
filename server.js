var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var db = mongoose.connection;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//serve static images for the app from the 'images' directory
app.use('/images', express.static(__dirname + '/images'));

//serve all things
app.use(express.static(__dirname + '/'));

if('development' == app.get('env')) {
	
	mongoose.connect('mongodb://127.0.0.1/budgy');
}

var envelopeSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
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

// update the envelope
app.put('/envelopes/:envelope_id', function (req, res) {
	
	var envelope_id = req.params.envelope_id;
	
	console.log('updating envelope_id: %s', envelope_id);
	
	// query for envelopes given the budget id parameter
	envelopeModel.findById(envelope_id, function(err, envelope) {
	
		if (err)
		{
			res.send(err);
		}
		
		envelope.amount = req.body.amount;
		envelope.category = req.body.category;
		
		envelope.save(function(err) {
		
			if (err)
			{
				res.send(err);
			}
			
			res.json({message: "envelope updated"});
		});
	});
});

// create the envelope
app.post('/envelopes', function (req, res) {
	
	console.log('creating envelope for budgetId: %s', req.body.bid);
	
	var envelope = new envelopeModel();
	
	envelope._id = mongoose.Types.ObjectId();
	envelope.bid = req.body.bid;
	envelope.cid = req.body.cid;
	envelope.category = req.body.category;
	envelope.amount = req.body.amount;
	envelope.spent = 0;
	envelope.balance = req.body.amount;
		
	envelope.save(function(err) {
		
		if (err)
		{
			console.log(err);
			res.send(err);
		}

		res.json({ message: 'envelope created' });
	});
	
});

app.listen(8080);