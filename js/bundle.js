(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/js/main.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var createRingRoad = require("./roadNetworkFactory").createRingRoad;
var RoadNetwork = _interopRequire(require("./roadNetwork"));

var RoadSegment = _interopRequire(require("./roadSegment"));

var raf = _interopRequire(require("./raf"));

// polyfill requestAnimationFrame
raf();

// dt is dynamically changed. See mainLoop.
var dt = 0.2;
var simulationTime = 0;
var iterationCount = 0;

var running = false;
var time = undefined;
var timeWarp = 4;


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
		if (iterationCount >= 1000) {
			running = false;

			roadNetwork.roadSegments[0].roadLanes[0].vehicles.forEach(function (vehicle) {
				console.log("vehicle: ", vehicle.id, "  pos: ", vehicle.position.toFixed(2), "  speed: ", vehicle.speed.toFixed(2), "  acc: ", vehicle.acc.toFixed(4), "   a: ", vehicle.carFollowingModelParameters.a);
			});
		}

		if (iterationCount % 100 === 0) {
			console.log("timeStep: ", dt, " -- simTime: ", simulationTime, " -- iterationcount: ", iterationCount);

			roadNetwork.roadSegments[0].roadLanes[0].vehicles.forEach(function (vehicle) {
				console.log("vehicle: ", vehicle.id, "  pos: ", vehicle.position.toFixed(2), "  speed: ", vehicle.speed.toFixed(2), "  acc: ", vehicle.acc.toFixed(4), "   a: ", vehicle.carFollowingModelParameters.a);
			});
		}

	} else {
		console.log("timeStep: ", dt, " -- simTime: ", simulationTime, " -- iterationcount: ", iterationCount);
	}
}

},{"./raf":"/Users/ralphgerm/js/movsim-es6/src/js/raf.js","./roadNetwork":"/Users/ralphgerm/js/movsim-es6/src/js/roadNetwork.js","./roadNetworkFactory":"/Users/ralphgerm/js/movsim-es6/src/js/roadNetworkFactory.js","./roadSegment":"/Users/ralphgerm/js/movsim-es6/src/js/roadSegment.js"}],"/Users/ralphgerm/js/movsim-es6/src/js/idm.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var IdmParameters = (function () {
  function IdmParameters() {
    var v0 = arguments[0] === undefined ? 20 : arguments[0];
    var a = arguments[1] === undefined ? 1.2 : arguments[1];
    var b = arguments[2] === undefined ? 1.2 : arguments[2];
    var T = arguments[3] === undefined ? 1.5 : arguments[3];
    var s0 = arguments[4] === undefined ? 2 : arguments[4];
    var s1 = arguments[5] === undefined ? 0 : arguments[5];
    var delta = arguments[6] === undefined ? 4 : arguments[6];
    _classCallCheck(this, IdmParameters);

    this.v0 = v0;
    this.a = a;
    this.b = b;
    this.T = T;
    this.s0 = s0;
    this.s1 = s1;
    this.delta = delta;
  }

  _prototypeProperties(IdmParameters, {
    getDefaultCar: {
      value: function getDefaultCar() {
        return new IdmParameters();
      },
      writable: true,
      configurable: true
    },
    getDefaultTruck: {
      value: function getDefaultTruck() {
        var defaultTruck = new IdmParameters();
        defaultTruck.v0 = 0.8 * defaultTruck.v0;
        defaultTruck.a = 0.8 * defaultTruck.a;
        defaultTruck.T = 1.2 * defaultTruck.T;
        return defaultTruck;
      },
      writable: true,
      configurable: true
    }
  });

  return IdmParameters;
})();

module.exports = IdmParameters;

},{}],"/Users/ralphgerm/js/movsim-es6/src/js/models.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var IdmParameters = _interopRequire(require("./idm"));




var maxDeceleration = 20;

var Models = (function () {
	function Models() {
		_classCallCheck(this, Models);
	}

	_prototypeProperties(Models, {
		idmCalcAcc: {
			value: function idmCalcAcc(s, v, vl, v0eff, parameters) {
				var accFree = parameters.a * (1 - Math.pow(v / v0eff, parameters.delta));
				var sstar = parameters.s0 + v * parameters.T + parameters.s1 * Math.sqrt((v + 0.0001) / v0eff) + 0.5 * v * (v - vl) / Math.sqrt(parameters.a * parameters.b);
				var accInt = -parameters.a * Math.pow(sstar / Math.max(s, parameters.s0), 2);
				return Math.max(-maxDeceleration, accFree + accInt);
			},
			writable: true,
			configurable: true
		},
		calculateAcceleration: {
			value: function calculateAcceleration(s, v, vl, v0eff, parameters) {
				// TODO check effective speed of instanceof call
				if (parameters instanceof IdmParameters) {
					return Models.idmCalcAcc(s, v, vl, v0eff, parameters);
				} else {
					throw Error("cannot map parameters to acceleration function" + parameters.toString());
				}
			},
			writable: true,
			configurable: true
		}
	});

	return Models;
})();

module.exports = Models;

},{"./idm":"/Users/ralphgerm/js/movsim-es6/src/js/idm.js"}],"/Users/ralphgerm/js/movsim-es6/src/js/raf.js":[function(require,module,exports){
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
    _getPositionInArray: {
      value: function _getPositionInArray(id) {
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

var Vehicle = _interopRequire(require("./vehicle"));

var IdmParameters = _interopRequire(require("./idm"));

var RoadSegment = (function () {
	function RoadSegment(options) {
		_classCallCheck(this, RoadSegment);

		this.parameters = options;
		this.roadLanes = [];
		this.numberOfLanes = options.numberOfLanes;

		for (var i = 1; i <= this.numberOfLanes; i++) {
			var roadLane = new RoadLane(this);
			this.roadLanes.push(roadLane);
		}

		var vehiclesInOneLane = options.roadLength * options.initDensityPerLane;
		var numberOfVehicles = Math.floor(this.numberOfLanes * vehiclesInOneLane);
		this._initializeVehicles(numberOfVehicles, options.initTruckFraction);

		console.log("constructor RoadSegment");
		debugger;
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
			value: function considerLaneChanges(dt) {},
			writable: true,
			configurable: true
		},
		updateVehicleAccelerations: {
			value: function updateVehicleAccelerations(dt) {
				for (var i = 0; i < this.numberOfLanes; i++) {
					this.roadLanes[i].updateVehicleAccelerations(dt);
				}
			},
			writable: true,
			configurable: true
		},
		updateVehiclePositionsAndSpeeds: {
			value: function updateVehiclePositionsAndSpeeds(dt) {
				for (var i = 0; i < this.numberOfLanes; i++) {
					this.roadLanes[i].updateSpeedAndPosition(dt);
				}
			},
			writable: true,
			configurable: true
		},
		checkForInconsistencies: {
			value: function checkForInconsistencies(dt) {},
			writable: true,
			configurable: true
		},
		updateOutflow: {
			value: function updateOutflow(dt) {
				for (var i = 0; i < this.numberOfLanes; i++) {
					this.roadLanes[i].updateOutflow(dt);
				}
			},
			writable: true,
			configurable: true
		},
		updateInflow: {
			value: function updateInflow(dt) {
				for (var i = 0; i < this.numberOfLanes; i++) {
					this.roadLanes[i].updateInflow(dt);
				}
			},
			writable: true,
			configurable: true
		},
		_initializeVehicles: {
			value: function _initializeVehicles(numberOfVehicles, truckFraction) {
				for (var i = 0; i < numberOfVehicles; i++) {
					var vehicleParameters = Vehicle.getDefaultParameters();
					vehicleParameters.isTruck = Math.random() < truckFraction;
					// initialize all vehicles with same speed determined by slower trucks
					vehicleParameters.speed = 0.8 * IdmParameters.getDefaultTruck().v0;
					vehicleParameters.position = i * 100; // TODO init correctly
					var vehicle = new Vehicle(vehicleParameters);
					var lane = i % this.roadLanes.length;
					this.roadLanes[lane].addVehicle(vehicle);
				}
			},
			writable: true,
			configurable: true
		}
	});

	return RoadSegment;
})();

module.exports = RoadSegment;
// TODO implement check for negative vehicle distances

},{"./idm":"/Users/ralphgerm/js/movsim-es6/src/js/idm.js","./roadLane":"/Users/ralphgerm/js/movsim-es6/src/js/roadLane.js","./vehicle":"/Users/ralphgerm/js/movsim-es6/src/js/vehicle.js"}],"/Users/ralphgerm/js/movsim-es6/src/js/vehicle.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var IdmParameters = _interopRequire(require("./idm"));

var Models = _interopRequire(require("./models"));

var numberOfCreatedVehicles = 0;

var Vehicle = (function () {
	function Vehicle(vehicleParameters) {
		_classCallCheck(this, Vehicle);

		this.vehicleParameters = vehicleParameters || getDefaultParameters();

		// public variables
		this.id = ++numberOfCreatedVehicles;
		this.isTruck = vehicleParameters.isTruck;
		this.length = vehicleParameters.length;
		this.width = vehicleParameters.width;
		this.position = vehicleParameters.position;
		this.speed = vehicleParameters.speed;
		this.acc = vehicleParameters.acc;
		this.carFollowingModelParameters = vehicleParameters.isTruck ? IdmParameters.getDefaultTruck() : IdmParameters.getDefaultCar();
		this.vLimit = this.carFollowingModelParameters.v0; // if effective speed limits, vLimit<v0
		this.vMax = this.carFollowingModelParameters.v0; // if vehicle restricts speed, vMax<vLimit, v0
		console.log("contructed vehicle with: ", this.vehicleParameters, this.carFollowingModelParameters);
	}

	_prototypeProperties(Vehicle, {
		getDefaultParameters: {
			value: function getDefaultParameters() {
				var isTruck = arguments[0] === undefined ? false : arguments[0];
				var vehicleParameters = {};
				vehicleParameters.isTruck = isTruck;
				vehicleParameters.length = isTruck ? 15 : 7;
				vehicleParameters.width = isTruck ? 3 : 2.5;
				vehicleParameters.position = 0;
				vehicleParameters.speed = 0;
				vehicleParameters.acc = 0;
				return vehicleParameters;
			},
			writable: true,
			configurable: true
		}
	}, {
		getRearPosition: {
			value: function getRearPosition() {
				return this.position - 0.5 * this.length;
			},
			writable: true,
			configurable: true
		},
		getFrontPosition: {
			value: function getFrontPosition() {
				return this.position + 0.5 * this.length;
			},
			writable: true,
			configurable: true
		},
		updateAcceleration: {
			value: function updateAcceleration(roadLane) {
				//        var leaderMoveable = roadLane.getFrontVehicle(this.position);

				var leaderMoveable = roadLane.getLeader(this);

				// TODO if no leader get a pre-defined Moveable set to infinity
				//if(leaderMoveable === null){
				//    leaderMoveable = Moveable.getMoveableAtInfinity();
				// }
				var leaderPosition = leaderMoveable ? leaderMoveable.position : 1000000;
				var leaderSpeed = leaderMoveable ? leaderMoveable.speed : 100;
				var leaderLength = leaderMoveable ? leaderMoveable.length : 0;
				var distance = leaderPosition - leaderLength - this.position;
				if (distance < 0) {
					distance = 40; // TODO just a hack here
					//throw new Error('negative distance');
				}

				var effectiveDesiredSpeed = Math.min(this.carFollowingModelParameters.v0, this.vLimit, this.vMax);
				this.acc = Models.calculateAcceleration(distance, this.speed, leaderSpeed, effectiveDesiredSpeed, this.carFollowingModelParameters);
			},
			writable: true,
			configurable: true
		},
		updateSpeedAndPosition: {
			value: function updateSpeedAndPosition(dt) {
				this.position += this.speed * dt + 0.5 * this.acc * dt * dt;
				this.speed += this.acc * dt;
				if (this.speed < 0) {
					this.speed = 0;
				}
				//        console.log('vehicle ', this.id, '   position: ', this.position, '   speed: ', this.speed, '    acc: ', this.acc);
			},
			writable: true,
			configurable: true
		}
	});

	return Vehicle;
})();

module.exports = Vehicle;

},{"./idm":"/Users/ralphgerm/js/movsim-es6/src/js/idm.js","./models":"/Users/ralphgerm/js/movsim-es6/src/js/models.js"}]},{},["./src/js/main.js"])


//# sourceMappingURL=bundle.js.map