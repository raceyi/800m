var express = require('express');
var router = express.Router();
var config = require('../config');

router.Response = function(result){
   this.result = result;
   this.version = config.VERSION;
}

router.FailResponse = function(error){
	this.result = "failure";
      this.error = error;
	this.version = config.VERSION;
};

router.SuccResponse=function(){
	this.result = "success";
	this.version = config.VERSION;
};

router.FailResponse.prototype = new router.Response("failure");

router.SuccResponse.prototype=new router.Response("Success");

module.exports = router;