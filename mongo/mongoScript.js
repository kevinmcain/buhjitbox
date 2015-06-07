var emailKevin = 'kevinmcain@hotmail.com'
var emailCinthia = 'cinthicula@hotmail.com'

db = db.getSiblingDB('buhjit')

db.createCollection('user')
db.user.remove({})
db.user.insert(
{
	fName: 'cinthia',
	lName: 'cain',
	username: 'cinthicula',
	email: emailCinthia,
	facebookProfileId: ''
}
)
db.user.insert(
{
	fName: 'kevin',
	lName: 'cain',
	username: 'kevinmcain',
	email: emailKevin,
	facebookProfileId: '10101916352705883'
}
)

db.createCollection('budget')
db.budget.remove({})
db.budget.insert({
	user_id: db.user.findOne({email: emailKevin})._id
}
)
db.budget.insert({
	user_id: db.user.findOne({email: emailCinthia})._id
}
)

var kevinsBudget = db.budget.findOne
	({user_id: db.user.findOne({email: emailKevin})._id})

db.createCollection('envelope')
db.envelope.remove({})
db.envelope.insert(
{
	budgetId: kevinsBudget._id.valueOf(), // should budgetId be an ObjectId or just a string value?
	category: "Groceries",
	amount: 300,
	transactions : [
		{
			_id : ObjectId(),
			description : "safeway",
			expense : 10,
			date : ISODate()
		}
	]
}
)

// canned category collection 
db.createCollection('category')
db.category.remove({})
db.category.insert(
{
	name: "Groceries"
}
)
db.category.insert(
{
	name: "Education"
}
)
db.category.insert(
{
	name: "Entertainment"
}
)
db.category.insert(
{
	name: "Gifts/donations"
}
)
db.category.insert(
{
	name: "Heath Care/Medical"
}
)
db.category.insert(
{
	name: "Shopping"
}
)
db.category.insert(
{
	name: "Savings/Investment"
}
)
db.category.insert(
{
	name: "Insurance"
}
)
db.category.insert(
{
	name: "Income"
}
)
db.category.insert(
{
	name: "Personal Care"
}
)
db.category.insert(
{
	name: "Housing"
}
)
db.category.insert(
{
	name: "Taxes"
}
)
db.category.insert(
{
	name: "Travel"
}
)
db.category.insert(
{
	name: "Children/Dependent expenses"
}
)
db.category.insert(
{
	name: "Automobile expenses"
}
)
