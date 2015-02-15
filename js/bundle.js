(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/js/main.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) {
	return obj && obj.__esModule ? obj["default"] : obj;
};

var Car = _interopRequire(require("./car"));

var Idm = _interopRequire(require("./idm"));




var longModelOptions = {
	a: 1.5,
	b: 1
};

var longModel = new Idm(longModelOptions);

var firstCar = new Car(longModel);
var secondCar = new Car(longModel);






},{"./car":"/Users/ralphgerm/js/homepage/src/js/car.js","./idm":"/Users/ralphgerm/js/homepage/src/js/idm.js"}],"/Users/ralphgerm/js/homepage/src/js/car.js":[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Car = function Car(longModel) {
	_classCallCheck(this, Car);

	this.longModel = longModel;
	console.log("New Car with: ", longModel);
};

module.exports = Car;

},{}],"/Users/ralphgerm/js/homepage/src/js/idm.js":[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Idm = function Idm(options) {
  _classCallCheck(this, Idm);

  this.a = options.a || 1;
  this.b = options.b || 1;

  console.log("a: ", this.a);
};

module.exports = Idm;

},{}]},{},["./src/js/main.js"])


//# sourceMappingURL=bundle.js.map