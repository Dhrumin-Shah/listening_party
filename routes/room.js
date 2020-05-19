var express = require('express');
var router = express.Router();

/* GET room page. */
router.get('/room', function(req, res, next) {
    res.render('room', { title: 'Room' });
});

module.exports = router;
