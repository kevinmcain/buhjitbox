var express = require('express')
	,mongoConn = require('./db.config')
	,facebookConfig = require('./fb.config')
	,mongoose = require('mongoose')
	,bodyParser = require('body-parser')
    ,util = require('util')
	,ejs = require('ejs')
	,http = require('http')
    ,morgan = require('morgan')
	,passport = require('passport')
	,methodOverride = require('method-override')
	,cookieParser = require('cookie-parser')
	,session = require('express-session')
	,facebookStrategy = require('passport-facebook').Strategy;

var app = express();
var db = mongoose.connection;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extend: false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.Router());

app.use(bodyParser.json());


//serve static images for the app from the 'images' directory
app.use('/images', express.static(__dirname + '/images'));

//serve all things
app.use(express.static(__dirname + '/'), function (req, res, next) {
  console.log('Request Type:', req.method);
  next();
});

if('development' == app.get('env')) {
	mongoose.connect('mongodb://127.0.0.1/buhjit');
}
else
{
	mongoose.connect(mongoConn.uri);
}

app.listen(process.env.PORT || 8080);

var usersSchema = mongoose.Schema({
	fName: String,
	lName: String,
	username: String,
	email: String,
	extra: String,
	facebookId: String,
	hashed_pwd: String
});

var budgetSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	user_id: mongoose.Schema.Types.ObjectId
});

var categorySchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: { type: String, required: true }
});

var envelopeSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	budgetId: { type: String, required: true },
	category: { type: String, required: true },
	amount: { type: Number, required: true },
	transactions : [{
					 description: String, 
				     expense: Number, 
				     date: Date}]
});

// specify modelName, schemaObject, collectionName
var UserModel = 
	mongoose.model('userModel', usersSchema, 'user');
	
var BudgetModel = 
	mongoose.model('budgetSchema', budgetSchema, 'budget');

var EnvelopeModel = 
	mongoose.model('envelopeModel', envelopeSchema, 'envelope');
	
var CategoryModel = 
	mongoose.model('categorySchema', categorySchema, 'category');	

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function (callback) {
  	console.log('opened mongo connection');
});


// =========================================================================
// FACEBOOK ================================================================
// =========================================================================

var FACEBOOK_APP_ID = facebookConfig.FACEBOOK_APP_ID;
var FACEBOOK_APP_SECRET = facebookConfig.FACEBOOK_APP_SECRET;
var FACEBOOK_CALLBACK_URL = 'http://buhjit.azurewebsites.net/auth/facebook/callback';
var FACEBOOK_LOCAL_CALLBACK_URL = 'http://localhost:8080/auth/facebook/callback';


// DIRECTIONS 
// MyApps -> Basic -> App Domains = buhjit.azurewebsites.net
// MyApps -> Basic -> Site URL = http://buhjit.azurewebsites.net/
// MyApps -> Advanced -> OAuth Settings -> Valid OAuth redirect URIs = http://buhjit.azurewebsites.net/auth/facebook/callback
// MyApps -> Advanced -> OAuth Settings -> Embedded browser OAuth Login = Yes

// used to serialize the user for the session
// passport.serializeUser(function(user, done) {
	// done(null, user.id);
// });

// // used to deserialize the user
// passport.deserializeUser(function(id, done) {
	// UserModel.findById(id, function(err, user) {
		// done(err, user);
	// });
// });

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new facebookStrategy({

	clientID        : FACEBOOK_APP_ID,
	clientSecret    : FACEBOOK_APP_SECRET,
	callbackURL     : FACEBOOK_LOCAL_CALLBACK_URL // FACEBOOK_CALLBACK_URL

},

// facebook will send back the token and profile
function(token, refreshToken, profile, done) {

	// asynchronous
	process.nextTick(function() {

	UserModel.findOne({ facebookProfileId: profile.id},
		function(err, user) {
			if (err) {
				console.log(err.errmsg);
				return done(err);
			}
			
			console.log('facebook profile id: %s', profile.id);
			
			if (user) {
				
				BudgetModel.findOne({ user_id: user.id.valueOf()},
					function(err, budget) {
						if (err) {
							console.log(err.errmsg);
						}
						else {
							user._doc.budgetId = budget.id.valueOf();
							return done(null, user); // user found, return that user
						}				
					}
				);
			}
			else
			{
				// var newUser            = new User();

				// // set all of the facebook information in our user model
				// newUser.facebook.id    = profile.id; // set the users facebook id                   
				// newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
				// newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
				// newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
			}
		}
	);

	});

}));

// =====================================
// FACEBOOK ROUTES =====================
// =====================================

app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {
		successRedirect : '/#/envelopes',
		failureRedirect : '/'
	}));
	
// route for logging out
app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});
	
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// =========================================================================
// FACEBOOK DONE ===========================================================
// =========================================================================

function getBudget() {

	BudgetModel.findOne({ user_id: userId},
		function(err, budget) {
			if (err) {
				console.log(err.errmsg);
			}
			else {
			
				req.session.budgetId = budget.id.valueOf();
				req.session.user = userId;
				req.session.username = user.username;
				req.session.email = user.email;

				//res.sendStatus(200);
				// should not be here, LoginController should next 
				res.redirect('/index.html');
			}				
		}
	);
}

app.get('/category', function (req, res) {
	
	CategoryModel.find({}, 
		function(err, category) {
		
		res.send(category);
	});
});

//get the transactions
app.get('/transactions/:envelopeID' , function (req, res){
	var envelope_ID = req.params.envelopeID;
	
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
	
	
	EnvelopeModel.aggregate([
		{ $match: { category: envelope_ID } },
		{ $unwind: "$transactions" },
		// only unwind those transactions occurring between prevMonth & nextMonth
		{ $match: {$and :[{"transactions.date" : {$gt: prevMonth}}, 
						 {"transactions.date" : {$lt: nextMonth}}]}},
        { $project: { envelope_id: "$_id"
			,transaction_id: "$transactions._id"
			,date: "$transactions.date"
			,description: "$transactions.description"
			,expense: "$transactions.expense"
			,_id: 0	} }
	], function(err, transactions) {
		if (err)
		{
			console.log(err.errmsg);
			res.send(err);
		}
		else
		{
			res.send(transactions);
		}
	});
	/*	var envelope_ID = req.params.envelopeID;
		
		console.log('selected envelope: %S',envelope_ID );
		EnvelopeModel.findOne({'category': envelope_ID}, function(err, envelope){
			res.json(envelope.transactions);
		}) */
});

//get the envelopes
app.get('/envelopes/:budgetId', isLoggedIn, function (req, res, next) {
	
	var budgetId = req.user.budgetId;
	
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
	
	console.log('requested budgetId: %s', budgetId);
	
	// Agregação Mongo é ridiculamente divertido
	EnvelopeModel.aggregate([
		{ $match: { budgetId: budgetId } },
		// if there are no transactions then we need to project one with 0 expense for this month
		{ $project: { "transactions" : { "$cond": { "if": { "$eq": [ { $size: "$transactions" }, 0 ] }, 
													"then": [ { "expense" : 0, "date": date}], 
													"else": "$transactions" } },
					  // we additionally need to project those members of our parent envelope doc											
					  doc: {
								budgetId: "$budgetId",
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
					 budgetId: "$_id.doc.budgetId",
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
		//res.json(envelopes); //vs having json?
	});
	
});


//create transaction
app.post('/transaction/:envelopeID' , function (req, res){
		
		var envelope_id = req.params.envelopeID;
		console.log('Adding Transaction to envelope : ',envelope_id );
		EnvelopeModel.findOneAndUpdate({'category': envelope_id},
			{ 
				"$addToSet": {
					"transactions": req.body
				}
			},	
		
		function(err,doc) {
				if (err)
				{
					console.log(err.errmsg);
					res.send(err);
				}
				else{
					console.log('transaction added');
					res.json({ message: 'transaction added!!' });					
				}				
			}
		);
});

// Update transaction
app.put('/transaction/:envelopeID' , function (req, res){
		
		var envelope_id = req.params.envelopeID;
		console.log('Updating Transaction to envelope : ',envelope_id );
		console.log('desc update: %s', req.body.expense);
		console.log('update id: %s', req.body.transaction_id);
		console.log('desc update: %s', req.body.description);
		var transactions = EnvelopeModel.transactions;
		EnvelopeModel.findOneAndUpdate({'category': envelope_id, "transactions._id": req.body.transaction_id}, 
			{ 
				"$set": {
					"transactions.$.expense": req.body.expense ,
					"transactions.$.description": req.body.description ,
					"transactions.$.date": req.body.date
				}				
			},	
		
			function(err,doc) {
				if (err)
				{
					console.log(err.errmsg);
					res.send(err);
				}
				else{
					console.log('transaction updated!!');
					res.json({ message: 'transaction updated!!' });					
				}				
			}
		);
});

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

// create the envelope
app.post('/envelopes', function (req, res) {
	
	console.log('creating envelope for budgetId: %s', req.user.budgetId);
	
	var envelope = new EnvelopeModel();
	
	envelope._id = mongoose.Types.ObjectId();
	envelope.budgetId = req.user.budgetId;
	envelope.category = req.body.category;
	envelope.amount = req.body.amount;
	
	envelope.save(function(err) {
		
		if (err)
		{
			console.log(err);
			res.send(err);
		}

		res.json({ message: 'envelope created' });
	});
	
});

//delete transaction

app.delete('/transaction/:envelope_id/:transaction_id', function (req, res) {
	
	var envelope_id = req.params.envelope_id;
	var trans_id = req.params.transaction_id;
//	console.log('deleting transaction');
	console.log('delete id: %s', envelope_id);
	console.log('delete id: %s', trans_id);
//	console.log('delete envelope id: %s', req.body.description);
	
	EnvelopeModel.update(
                 {}, 
                 {$pull: {transactions: {_id: trans_id}}},  
                 { multi: true },
                 function(err, data){
					 if(err)
                      console.log(err, data);
					else
						res.json({ message: 'transaction deleted' });
                 }
    );

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
