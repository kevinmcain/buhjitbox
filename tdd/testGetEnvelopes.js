console.log('starting test');
var chai = require('chai');
var chaiHttp = require('chai-http');
var async = require('async');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var http = require('http');
chai.use(chaiHttp);

describe('Test get envelopes result', function () {
	this.timeout(15000);

	var requestResult;
	var response;
		 
	before(function(done) {
		chai.request('http://localhost')
			.get('/envelopes/1')
			.end(function (err, res) {
				requestResult = res.body;
				response = res;
				done();
			});
	});

	it('Should return an array with one object', function(done){
		expect(response).to.have.status(200);
		expect(requestResult).to.be.an.object;
		expect(requestResult).to.have.length.above(1);
		expect(response).to.have.headers;
		done();
	});
	it('The first entry in the array has known properties', function(done){
		expect(requestResult[0]).to.include.keys('_id');
		expect(response).to.have.deep.property('body[0].bid', '1');
		expect(response.body).to.not.be.a.string;
		done();
	});

	it('The elements in the array have the expected properties', function(done){
		expect(response.body).to.satisfy(
			function (body) {
				for (var i = 0; i < body.length; i++) {
					expect(body[i]).to.have.property('_id');
					expect(body[i]).to.have.property('bid');
					expect(body[i]).to.have.property('category');
					expect(body[i]).to.have.property('amount');
					expect(body[i]).to.have.property('spent');
					expect(body[i]).to.have.property('balance');
					expect(body[i]).to.have.property('percentageSpent');
					expect(body[i]).to.have.property('numberOfTransactions');
				}
				return true;
			});
		done();
	});	
	
});