var express = require('express');
var events = require('../events.js');
var router = express.Router();

router.get('/events', function(req, res) {
console.log(events.getEvents(18));
res.end();
});


module.exports = router;