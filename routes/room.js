var express = require('express');
var router = express.Router();
var path = require('path');

/* GET room page. */
router.get('/', function(req, res, next) {
    res.sendFile('room.html', { root: path.join(__dirname, '../public') });
});

module.exports = router;
