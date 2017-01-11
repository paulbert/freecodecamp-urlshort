
function urlsDAO (db) {
	
	var collection = 'urls',
		collectionObj = db.collection(collection);
	
	function getUrl(code,callback) {
		collectionObj.findOne({code:code},function(err,doc) {
			if(doc) {
				return callback(null,doc);
			} else {
				return callback('Not found',null);
			}
		});
	}
	
	function addUrl(url,callback) {
		collectionObj.findOne({url:url},function(err,doc) {
			if(doc) {
				callback(null,doc);
			} else {
				var insObj = {code:generateCode(),url:url};
				db.collection(collection).insert(insObj,function(err) {
					callback(null,insObj);
				});
			}
		});
	}
	
	function generateCode() {
		return Date.now().toString(36);
	}
	
	return {
		getUrl:getUrl,
		addUrl:addUrl
	};
};

module.exports = urlsDAO;