const mongoose = require('mongoose');
const Sheet = mongoose.model('sheets');

module.exports = app => {
	app.get('/api', async (req, res) => {
		console.log('app.get(/api)');
		console.log('mongoose.connections.length', mongoose.connections.length);
		Sheet.findOne(function(err, sheet) {
			if (err) {
				console.log(err);
			}
			console.log('got Sheet', sheet);
			res.send(sheet);
		});
	});

	app.get('/api/sheets/:sheetId', async (req, res) => {
		const sheetId = req.path.match(/\/api\/sheets\/([0-9a-zA-Z]+)/)[1];
		console.log('/api/sheets/:sheetId req.path', req.path, 'sheetId', sheetId);
		Sheet.findById(sheetId, function(err, sheet) {
			if (err) {
				console.log(err);
			}
			console.log('got Sheet', sheet);
			res.send(sheet);
		});
	});
};
