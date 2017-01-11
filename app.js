var	express = require('express'),
	app = express(),
	urlsDAO = require('./urlsDAO'),
	MongoClient = require('mongodb');

	
var db_name = 'urlApp',
	mongodb_connection_string = 'mongodb://127.0.0.1:27017/' + db_name,
	hostDomain = 'localhost:3000/';

MongoClient.connect(mongodb_connection_string,function(err,db) {
	
	var urls = urlsDAO(db);
	
	if(!err) {
		app.set('port',process.env.PORT || 3000);
		app.get('/',function(req,res) {
			res.sendfile('views/index.html', {root: __dirname })
		});
	
		app.get('/favicon.ico', function(req, res) {
			res.sendStatus(200);
		});

		var protocolCheck = function(url) {
			var nextString = url.slice(4);
			if(url.slice(0,4) !== 'http') {
				return 'no protocol type';
			} else if(url.slice(4,5) === 's') {
				nextString = url.slice(5);
			}
			if(nextString.slice(0,3) !== '://') {
				return 'no colon slashes';
			}
			return domainCheck(nextString.slice(3));
		};

		var domainCheck = function(str) {
			var domain = str.match(/[^/]*/)[0];
			if(domain.indexOf('.') === -1) {
				return false;
			}
			return true;
		};

		app.get('/new/*',function(req,res) {

			var url = req.params[0],
				queryString = req.originalUrl.match(/\?.*/);
	
			queryString = queryString ? queryString[0] : '';
	
			if(protocolCheck(url) === true) {
				urls.addUrl(url + queryString,function(err,doc) {
					if(err) {
						res.send({error:err});
					} else {
						res.send({original_url:doc.url,short_url:hostDomain + doc.code});
					}
				});
			} else {
				res.send({error:'Invalid url'});
			}
		});
		
		app.get('/:code', function(req, res) {
			var code = req.params.code;
			urls.getUrl(code,function(err,doc) {
				if(err) {
					res.send({error:'Url not found'});
				} else {
					res.redirect(301,doc.url);
				}
			});
		});

		app.listen(app.get('port'), function() {
			console.log("Node app is running at localhost:" + app.get('port'));
		});
	}
});