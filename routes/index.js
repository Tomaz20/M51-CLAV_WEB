var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('pugdex', {page: "index"});
});

module.exports = router;
