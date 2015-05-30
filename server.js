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
	//mongoose.connect('mongodb://sa:<password>@ds034878.mongolab.com:34878/buhjit');
	mongoose.connect('mongodb://127.0.0.1/budgy');
}

var envelopeSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	bid: { type: String, required: true },
	category: { type: String, required: true },
	amount: { type: Number, required: true },
	transactions : [{description: String, 
				     expense: Number, 
				     date: Date}]
});

// specify modelName, schemaObject, collectionName
var EnvelopeModel = 
	mongoose.model('envelopeModel', envelopeSchema, 'envelope');

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function (callback) {
  	console.log('opened mongo connection');
});

app.get('/envelopes/:budgetId', function (req, res) {
	
	var budgetId = req.params.budgetId;
	
	var date = new Date();
	
	// last day of the previous month
	var prevMonth = new Date();
	prevMonth.setDate(0);
	prevMonth.setHours(23,59,59,999);
	
	// first day of the next month
	var nextMonth = new Date();
	nextMonth.setDate(1);
	nextMonth.setMonth(nextMonth.getMonth()+1);
	nextMonth.setHours(0,0,0,0);
	
	console.log('requested bid: %s', budgetId);
	
	// Agregação Mongo é ridiculamente divertido
	EnvelopeModel.aggregate([
		{ $match: { bid: budgetId } },
		// if there are no transactions then we need to project one with 0 expense for this month
		{ $project: { "transactions" : { "$cond": { "if": { "$eq": [ { $size: "$transactions" }, 0 ] }, 
													"then": [ { "expense" : 0, "date": date}], 
													"else": "$transactions" } },
					  // we additionally need to project those members of our parent envelope doc											
					  doc: {
								bid: "$bid",
								category: "$category",
								amount: "$amount"
						   } 
					}
		},
		{ $unwind: "$transactions" },
		// but only unwind those transactions occurring between prevMonth & nextMonth
		{ $match: {$and :[{"transactions.date" : {$gt: prevMonth}}, 
						 {"transactions.date" : {$lt: nextMonth}}]}},
		// preserve the transaction members							
		{ $project: { doc: 1, 
					  transaction_id: "$transactions._id", 
					  transactions_doc: {
											expense: "$transactions.expense"
										}
					}
		},
		// group back the results
		{ $group: {
					_id: {
						   _id: "$_id", 
						   transaction_id: "$transaction_id", 
						   doc: "$doc", 
						   transaction_doc: "$transactions_doc"
						}
					}
		},
		{ $group: {
					_id:{
							_id: "$_id._id",
							doc: "$_id.doc"
						},
					spent: { $sum: "$_id.transaction_doc.expense" },
					transactionCount: { $sum: 1 }
				}
		},
		// project back the root doc attributes
		{ $project: { _id: "$_id._id",
					 bid: "$_id.doc.bid",
					 category: "$_id.doc.category",
					 amount: "$_id.doc.amount",
					 spent: 1,
					 balance: {$subtract:["$_id.doc.amount", "$spent"]},
					 percentageSpent: {$divide:["$spent", "$_id.doc.amount"]},
					 numberOfTransactions: { "$cond": { "if": { "$eq": [ "$spent", 0 ] }, 
														"then": 0, 
														"else": "$transactionCount" } }
					 }
		}
	], function(err, envelopes) {
		res.send(envelopes);
	});
	
});

// ---------------------------------------------------------------
// ----------------------Get Transactions ------------------------
// ---------------------------------------------------------------
// var ObjectId = mongoose.Types.ObjectId;
// var envelope_id = ObjectId("5569fd89ec5185c01b374d02");

// EnvelopeModel.aggregate([
	// { $match: { _id: envelope_id } },
	// { $unwind: "$transactions" },
	// // only unwind those transactions occurring between prevMonth & nextMonth
	// { $match: {$and :[{"transactions.date" : {$gt: prevMonth}}, 
					 // {"transactions.date" : {$lt: nextMonth}}]}},
	// { $project: { envelope_id: "$_id"
		// ,transaction_id: "$transactions._id"
		// ,date: "$transactions.date"
		// ,description: "$transactions.description"
		// ,expense: "$transactions.expense"
		// ,_id: 0	} }
// ], function(err, transactions) {
	// if (err)
	// {
		// console.log(err.errmsg);
		// res.send(err);
	// }
	// else
	// {
		// res.send(transactions);
	// }
// });
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------

// update the envelope
app.put('/envelopes/:envelope_id', function (req, res) {
	
	var envelope_id = req.params.envelope_id;
	
	console.log('updating envelope_id: %s', envelope_id);
	
	// query for envelopes given the budget id parameter
	EnvelopeModel.findById(envelope_id, function(err, envelope) {
	
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

// ---------------------------------------------------------------
// ----------------------Update Transactions ---------------------
// ---------------------------------------------------------------
// var transactions = envelope.transactions;
// var transaction = transactions[0];

// console.log('_id: %s, desc: %s, expense: %s, date: %s'
	// ,transaction._id
	// ,transaction.description
	// ,transaction.expense
	// ,transaction.date);

// transaction.expense = 3;

// EnvelopeModel.findOneAndUpdate(
// { "_id": envelope_id, "transactions._id": transaction._id },
	// { 
		// "$set": {
			// "transactions.$": transaction
		// }
		
		// // alternatively, you can update individual members
		// // "$set": {
			// // "transactions.$.expense": transaction.expense
		// // }
	// },
	// function(err,doc) {
		// if (err)
		// {
			// console.log(err.errmsg);
		// }
	// }
// );
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------

// create the envelope
app.post('/envelopes', function (req, res) {
	
	console.log('creating envelope for budgetId: %s', req.body.bid);
	
	var envelope = new EnvelopeModel();
	
	envelope._id = mongoose.Types.ObjectId();
	envelope.bid = req.body.bid;
	envelope.category = req.body.category;
	envelope.amount = req.body.amount;
	
	// for testing
	var now = new Date();
	//now.setMonth(11);
	envelope.transactions = [{'description':'test','expense':2, 'date':now}
	,{'description':'test','expense':2, 'date':now}
	,{'description':'test','expense':1, 'date':now}];
		
	envelope.save(function(err) {
		
		if (err)
		{
			console.log(err);
			res.send(err);
		}

		res.json({ message: 'envelope created' });
	});
	
});

app.delete('/envelopes/:envelope_id', function (req, res) {
	
	var envelope_id = req.params.envelope_id;
	console.log('deleting envelope_id: %s', envelope_id);
		
	EnvelopeModel.findByIdAndRemove(envelope_id, function(err) {
		
		if (err)
		{
			console.log(err);
			res.send(err);
		}

		res.json({ message: 'envelope deleted' });
	});
});


app.listen(8080);
//app.listen(process.env.PORT);