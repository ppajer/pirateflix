const JStorage = require('electron-json-storage');

function readSetting(key, callback) {

	JStorage.get(key, function(err, res) {
		
		if (err) {
		
			console.error(err);
			callback(false);
		
		} else {
			
			if (res === {}) {
				
				callback(false);

			} else {
				
				callback(res);
			}
		}
	});
}

function writeSetting(key, value, callback) {

	JStorage.set(key, value, function(err, res) {
		
		if (err) {
		
			console.error(err);
			callback(false);
		
		} else {
		
			if (res === {}) {
				
				callback(false);
				
			} else {
				
				callback(res);
			}
		}
	});
}

function getSettingKeys(callback) {

	JStorage.keys(function(err, res) {
		
		if (err) {
		
			console.error(err);
			callback(false);
		
		} else {
		
			if (res === {}) {
				
				callback(false);
				
			} else {
				
				callback(res);
			}
		}
	})
};

module.exports.write 	= writeSetting;
module.exports.read 	= readSetting;
module.exports.getKeys 	= getSettingKeys;