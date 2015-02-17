(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/js/main.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var createRingRoad = require("./roadNetworkFactory").createRingRoad;
var RoadNetwork = _interopRequire(require("./roadNetwork"));

var RoadSegment = _interopRequire(require("./roadSegment"));

var raf = _interopRequire(require("./raf"));

raf();

var dt = 0.2;
var simulationTime = 0;
var iterationCount = 0;

var running = false;
var time = undefined;
var timeWarp = 4;

// let roadNetwork = new RoadNetwork();
//
// let roadSegment1 = new RoadSegment(1);
// let roadSegment2 = new RoadSegment(3);
//
// roadNetwork.addRoadSegment(roadSegment1);
// roadNetwork.addRoadSegment(roadSegment2);

var roadLength = 1000;
var numberOfLanes = 1;
var roadNetwork = createRingRoad(roadLength, numberOfLanes);

debugger;
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

},{"./raf":"/Users/ralphgerm/js/movsim-es6/src/js/raf.js","./roadNetwork":"/Users/ralphgerm/js/movsim-es6/src/js/roadNetwork.js","./roadNetworkFactory":"/Users/ralphgerm/js/movsim-es6/src/js/roadNetworkFactory.js","./roadSegment":"/Users/ralphgerm/js/movsim-es6/src/js/roadSegment.js"}],"/Users/ralphgerm/js/movsim-es6/src/js/raf.js":[function(require,module,exports){
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

},{}],"/Users/ralphgerm/js/movsim-es6/src/js/roadLane.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var RoadLane = (function () {
  function RoadLane(roadSegment) {
    _classCallCheck(this, RoadLane);

    this.vehicles = [];
    this.roadSegment = roadSegment;
    this.sinkLaneSegment = null; //TODO
    this.sourceLaneSegment = null; //TODO
  }

  _prototypeProperties(RoadLane, null, {
    getRoadLength: {
      value: function getRoadLength() {
        return this.roadSegment.roadLength;
      },
      writable: true,
      configurable: true
    },
    addVehicle: {
      value: function addVehicle(vehicle) {
        this.vehicles.push(vehicle);
      },
      writable: true,
      configurable: true
    },
    updateVehicleAccelerations: {
      value: function updateVehicleAccelerations() {
        for (var i = 0, len = this.vehicles.length; i < len; i++) {
          var vehicle = this.vehicles[i];
          vehicle.updateAcceleration(this);
        }
      },
      writable: true,
      configurable: true
    },
    updateSpeedAndPosition: {
      value: function updateSpeedAndPosition(dt) {
        for (var i = 0; i < this.vehicles.length; i++) {
          var vehicle = this.vehicles[i];
          vehicle.updateSpeedAndPosition(dt);
          if (this.roadSegment.parameters.ringRoad && vehicle.position > this.roadSegment.parameters.roadLength) {
            vehicle.position -= this.roadSegment.parameters.roadLength;
          }
        }
      },
      writable: true,
      configurable: true
    },
    getLaneRearVehicle: {
      value: function getLaneRearVehicle() {
        if (this.vehicles.length > 0) {
          return this.vehicles[this.vehicles.length - 1];
        }
        return null;
      },
      writable: true,
      configurable: true
    },
    getLaneFrontVehicle: {
      value: function getLaneFrontVehicle() {
        if (this.vehicles.length > 0) {
          return this.vehicles[0];
        }
        return null;
      },
      writable: true,
      configurable: true
    },
    getRearVehicle: {
      value: function getRearVehicle(position) {
        var index = this._positionBinarySearch(position);
        var insertionPoint = -index - 1;
        if (index >= 0) {
          // exact match found, so return the matched vehicle
          if (index < this.vehicles.length) {
            return this.vehicles[index];
          }
        } else {
          // get next vehicle if not past end
          if (insertionPoint < this.vehicles.length) {
            return this.vehicles[insertionPoint];
          }
        }
        if (this.sourceLaneSegment !== null) {
          // didn't find a rear vehicle in the current road segment, so
          // check the previous (source) road segment
          // and continue until a vehicle is found or no further source is connected to laneSegment
          var sourceFrontVehicle = null;
          var source = this.sourceLaneSegment;
          var accumDistance = 0;
          do {
            accumDistance += source.getRoadLength();
            sourceFrontVehicle = source.laneFrontVehicle();
            source = source.sourceLaneSegment();
          } while (sourceFrontVehicle === null && source !== null);
          if (sourceFrontVehicle !== null) {
            var newPosition = sourceFrontVehicle.getFrontPosition() - accumDistance;
            return movsim.simulation.moveable.create(sourceFrontVehicle, newPosition);
          }
        }
        return null;
      },
      writable: true,
      configurable: true
    },
    getFrontVehicle: {
      value: function getFrontVehicle(position) {
        var index = this._positionBinarySearch(position);
        var insertionPoint = -index - 1;
        if (index > 0) {
          return this.vehicles[index - 1]; // exact match found
        } else if (insertionPoint > 0) {
          return this.vehicles[insertionPoint - 1];
        }
        // index == 0 or insertionPoint == 0
        // subject vehicle is front vehicle on this road segment, so check for vehicles
        // on sink lane segment
        if (this.sinkLaneSegment !== null) {
          var sinkRearVehicle = null;
          var sink = this.sinkLaneSegment;
          var accumDistance = this.getRoadLength();
          do {
            sinkRearVehicle = sink.rearVehicle();
            if (sinkRearVehicle === null) {
              accumDistance += sink.getRoadLength();
            }
            sink = sink.sinkLaneSegment();
          } while (sinkRearVehicle === null && sink !== null);
          if (sinkRearVehicle !== null) {
            var newPosition = sinkRearVehicle.getFrontPosition() + accumDistance;
            return movsim.simulation.moveable.create(sinkRearVehicle, newPosition);
          }
        }
        return null;
      },
      writable: true,
      configurable: true
    },
    updateOutflow: {
      value: function updateOutflow(dt) {
        // remove vehicles with position > this.roadSegment.roadLength (later: assign to linked lane)
        // for ringroad set vehicle at beginning of lane (periodic boundary conditions)
        var roadLength = this.roadSegment.roadLength;
        var vehicle;
        for (var i = 0, len = this.vehicles.length; i < len; i++) {
          vehicle = this.vehicles[i];
          if (vehicle.position > roadLength) {
            //                this.vehicles.remove(i);
            // ring road special case TODO remove
            vehicle.position -= roadLength;
          }
        }
        this._sortVehicles();
      },
      writable: true,
      configurable: true
    },
    updateInflow: {
      value: function updateInflow(dt) {},
      writable: true,
      configurable: true
    },
    _sortVehicles: {
      value: function _sortVehicles() {
        this.vehicles.sort(function (a, b) {
          return a.position - b.position;
        });
      },
      writable: true,
      configurable: true
    },
    getLeader: {
      value: function getLeader(vehicle) {
        var vehicleIndex = this._getPositionInArray(vehicle.id);
        if (this.vehicles.length <= 1) {
          return null;
        }
        if (vehicleIndex === this.vehicles.length - 1) {
          return this.roadSegment.ringRoad === true ? this.vehicles[0] : null;
        }
        return this.vehicles[vehicleIndex + 1];
      },
      writable: true,
      configurable: true
    },
    getPositionInArray: {
      value: function getPositionInArray(id) {
        // TODO es6 -> findIndex
        var index = this.vehicles.map(function (el) {
          return el.id;
        }).indexOf(id);
        return index;
      },
      writable: true,
      configurable: true
    }
  });

  return RoadLane;
})();

module.exports = RoadLane;
// TODO

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

},{}],"/Users/ralphgerm/js/movsim-es6/src/js/roadNetworkFactory.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.createRingRoad = createRingRoad;
var RoadNetwork = _interopRequire(require("./roadNetwork"));

var RoadSegment = _interopRequire(require("./roadSegment"));

function createRingRoad(roadLength, numberOfLanes) {
  var roadNetwork = new RoadNetwork();

  // create one roadSection representing a ring road (anti-clockwise driving direction)
  var roadSegmentParameters = RoadSegment.getDefaultParameters();
  roadSegmentParameters.ringRoad = true;
  roadSegmentParameters.roadLength = roadLength;
  roadSegmentParameters.numberOfLanes = numberOfLanes;
  roadSegmentParameters.globalX = 0;
  roadSegmentParameters.globalY = 200;
  roadSegmentParameters.heading = 0;
  roadSegmentParameters.curvature = 2 * Math.PI / roadLength;

  var roadSegment = new RoadSegment(roadSegmentParameters);

  roadNetwork.addRoadSegment(roadSegment);
  return roadNetwork;
};
Object.defineProperty(exports, "__esModule", {
  value: true
});

},{"./roadNetwork":"/Users/ralphgerm/js/movsim-es6/src/js/roadNetwork.js","./roadSegment":"/Users/ralphgerm/js/movsim-es6/src/js/roadSegment.js"}],"/Users/ralphgerm/js/movsim-es6/src/js/roadSegment.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var RoadLane = _interopRequire(require("./roadLane"));

var RoadSegment = (function () {
	function RoadSegment(options) {
		_classCallCheck(this, RoadSegment);

		this.roadLanes = [];
		debugger;
		for (var i = 0; i <= options.numberOfLanes; i++) {
			var roadLane = new RoadLane(this);
			this.roadLanes.push(roadLane);
		}

		console.log("constructor RoadSegment");
	}

	_prototypeProperties(RoadSegment, {
		getDefaultParameters: {
			value: function getDefaultParameters() {
				var roadSectionParameters = {};
				roadSectionParameters.roadLength = 1000;
				roadSectionParameters.numberOfLanes = 1;
				roadSectionParameters.initDensityPerLane = 10 / 1000;
				roadSectionParameters.initTruckFraction = 0.1;
				roadSectionParameters.ringRoad = false;
				roadSectionParameters.globalX = 0;
				roadSectionParameters.globalY = 0;
				roadSectionParameters.heading = 0;
				roadSectionParameters.curvature = 0;
				roadSectionParameters.laneWidth = 10;
				return roadSectionParameters;
			},
			writable: true,
			configurable: true
		}
	}, {
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
				for (var i = 0; i < lanes; i++) {
					this.roadLanes[i].updateVehicleAccelerations(dt);
				}
			},
			writable: true,
			configurable: true
		},
		updateVehiclePositionsAndSpeeds: {
			value: function updateVehiclePositionsAndSpeeds(dt) {
				console.log("updateVehiclePositionsAndSpeeds with dt: ", dt);
				for (var i = 0; i < lanes; i++) {
					this.roadLanes[i].updateVehiclePositionsAndSpeeds(dt);
				}
			},
			writable: true,
			configurable: true
		},
		checkForInconsistencies: {
			value: function checkForInconsistencies(dt) {
				console.log("checkForInconsistencies with dt: ", dt);
				// TODO implement check for negative vehicle distances
			},
			writable: true,
			configurable: true
		},
		updateOutflow: {
			value: function updateOutflow(dt) {
				console.log("updateOutflow with dt: ", dt);
				for (var i = 0; i < lanes; i++) {
					this.roadLanes[i].updateOutflow(dt);
				}
			},
			writable: true,
			configurable: true
		},
		updateInflow: {
			value: function updateInflow(dt) {
				console.log("updateInflow with dt: ", dt);
				for (var i = 0; i < lanes; i++) {
					this.roadLanes[i].updateInflow(dt);
				}
			},
			writable: true,
			configurable: true
		}
	});

	return RoadSegment;
})();

module.exports = RoadSegment;

},{"./roadLane":"/Users/ralphgerm/js/movsim-es6/src/js/roadLane.js"}]},{},["./src/js/main.js"])


//# sourceMappingURL=bundle.js.map