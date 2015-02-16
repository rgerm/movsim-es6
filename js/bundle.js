(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/js/main.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var RoadNetwork = _interopRequire(require("./roadNetwork"));

var RoadSegment = _interopRequire(require("./raodSegment"));

var raf = _interopRequire(require("./raf"));

raf();

var dt = 0.2;
var simulationTime = 0;
var iterationCount = 0;

var running = false;
var time = undefined;
var timeWarp = 4;

var roadNetwork = new RoadNetwork();

var roadSegment1 = new RoadSegment(1);
var roadSegment2 = new RoadSegment(3);

roadNetwork.addRoadSegment(roadSegment1);
roadNetwork.addRoadSegment(roadSegment2);


start();

function start() {
  running = true;
  time = new Date().getTime();
  mainLoop();
}

function mainLoop() {
  if (running) {
    requestAnimationFrame(mainLoop);

    var now = new Date().getTime();
    dt = (now - (time || now)) / 1000;
    dt *= timeWarp;
    time = now;

    // update state
    simulationTime += dt;
    iterationCount++;
    roadNetwork.timeStep(dt);

    // draw

    // limit iterations for now
    if (iterationCount >= 5) {
      running = false;
    }
  } else {
    console.log("timeStep: ", dt, " -- simTime: ", simulationTime, " -- iterationcount: ", iterationCount);
  }
}

},{"./raf":"/Users/ralphgerm/js/movsim-es6/src/js/raf.js","./raodSegment":"/Users/ralphgerm/js/movsim-es6/src/js/raodSegment.js","./roadNetwork":"/Users/ralphgerm/js/movsim-es6/src/js/roadNetwork.js"}],"/Users/ralphgerm/js/movsim-es6/src/js/raf.js":[function(require,module,exports){
"use strict";

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

module.exports = raf;
function raf() {
	var lastTime = 0;
	var vendors = ["ms", "moz", "webkit", "o"];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
		window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
	}

	if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
		var currTime = new Date().getTime();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function () {
			callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};

	if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};

	console.log("requestAnimationFrame set: ", window.requestAnimationFrame);
}

},{}],"/Users/ralphgerm/js/movsim-es6/src/js/raodSegment.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var RoadSegment = (function () {
  function RoadSegment(lanes) {
    _classCallCheck(this, RoadSegment);

    this.roadLanes = [];

    for (var i = 0; i < lanes; i++) {
      var roadLane = i;
      this.roadLanes.push(roadLane);
    }

    console.log("constructor RoadSegment");
  }

  _prototypeProperties(RoadSegment, null, {
    considerLaneChanges: {
      value: function considerLaneChanges(dt) {
        console.log("no lane changes");
      },
      writable: true,
      configurable: true
    },
    updateVehicleAccelerations: {
      value: function updateVehicleAccelerations(dt) {
        console.log("updateVehicleAccelerations with dt: ", dt);
      },
      writable: true,
      configurable: true
    },
    updateVehiclePositionsAndSpeeds: {
      value: function updateVehiclePositionsAndSpeeds(dt) {
        console.log("updateVehiclePositionsAndSpeeds with dt: ", dt);
      },
      writable: true,
      configurable: true
    },
    checkForInconsistencies: {
      value: function checkForInconsistencies(dt) {
        console.log("checkForInconsistencies with dt: ", dt);
      },
      writable: true,
      configurable: true
    },
    updateOutflow: {
      value: function updateOutflow(dt) {
        console.log("updateOutflow with dt: ", dt);
      },
      writable: true,
      configurable: true
    },
    updateInflow: {
      value: function updateInflow(dt) {
        console.log("updateInflow with dt: ", dt);
      },
      writable: true,
      configurable: true
    }
  });

  return RoadSegment;
})();

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
					roadSegmet.considerLaneChanges(dt);
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