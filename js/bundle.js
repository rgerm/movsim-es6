(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/js/main.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var RoadNetwork = _interopRequire(require("./roadNetwork"));

var RoadSegment = _interopRequire(require("./raodSegment"));




var roadNetwork = new RoadNetwork();

var roadSegment1 = new RoadSegment(1);
var roadSegment2 = new RoadSegment(3);

roadNetwork.addRoadSegment(roadSegment1);
roadNetwork.addRoadSegment(roadSegment2);

},{"./raodSegment":"/Users/ralphgerm/js/movsim-es6/src/js/raodSegment.js","./roadNetwork":"/Users/ralphgerm/js/movsim-es6/src/js/roadNetwork.js"}],"/Users/ralphgerm/js/movsim-es6/src/js/raodSegment.js":[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var RoadSegment = function RoadSegment(lanes) {
  _classCallCheck(this, RoadSegment);

  this.roadLanes = [];

  for (var i = 0; i < lanes; i++) {
    var roadLane = i;
    this.roadLanes.push(roadLane);
  }

  console.log("constructor RoadSegment");
};

module.exports = RoadSegment;

},{}],"/Users/ralphgerm/js/movsim-es6/src/js/roadNetwork.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var RoadNetwork = (function () {
	function RoadNetwork() {
		_classCallCheck(this, RoadNetwork);

		this.roadSegments = [];
		console.log("contructor RoadNetwork");
	}

	_prototypeProperties(RoadNetwork, null, {
		addRoadSegment: {
			value: function addRoadSegment(roadSegment) {
				this.roadSegments.push(roadSegment);
				console.log("  added ", roadSegment, " to roadNetwork", this.roadSegments);
			},
			writable: true,
			configurable: true
		},
		timeStep: {
			value: function timeStep(dt) {
				this.roadSegments.forEach(function (roadSegmet) {
					roadSegmet.makeLaneChanges(dt);
				});

				this.roadSegments.forEach(function (roadSegmet) {
					roadSegmet.updateVehicleAccelerations(dt);
				});

				this.roadSegments.forEach(function (roadSegmet) {
					roadSegmet.updateVehiclePositionsAndSpeeds(dt);
				});

				// for debugging
				this.roadSegments.forEach(function (roadSegmet) {
					roadSegmet.checkForInconsistencies(dt);
				});

				this.roadSegments.forEach(function (roadSegmet) {
					roadSegmet.updateOutflow(dt);
				});

				this.roadSegments.forEach(function (roadSegmet) {
					roadSegmet.updateInflow(dt);
				});
			},
			writable: true,
			configurable: true
		}
	});

	return RoadNetwork;
})();

module.exports = RoadNetwork;

},{}]},{},["./src/js/main.js"])


//# sourceMappingURL=bundle.js.map