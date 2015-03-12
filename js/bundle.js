(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/js/main.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var createRingRoad = require("./roadNetworkFactory").createRingRoad;
var RoadNetwork = _interopRequire(require("./roadNetwork"));

var RoadSegment = _interopRequire(require("./roadSegment"));

var raf = _interopRequire(require("./raf"));

var Renderer = _interopRequire(require("./renderer"));

var loadResources = require("./resources").loadResources;



// polyfill requestAnimationFrame
raf();

// dt is dynamically changed. See mainLoop.
var dt = 0.2;
var simulationTime = 0;
var iterationCount = 0;

var running = false;
var time = undefined;
var timeWarp = 4;

var renderer = undefined;
var roadNetwork = undefined;

loadResources(function () {
	var roadLength = 1000;
	var numberOfLanes = 1;
	roadNetwork = createRingRoad(roadLength, numberOfLanes);

	renderer = new Renderer(roadNetwork);
	renderer.drawRoads();
	renderer.drawBackground();

	start();
});

function start() {
	running = true;
	time = new Date().getTime();
	mainLoop();
}

function stop() {
	running = false;
};

function reset() {
	dt = 0.2;
	simulationTime = 0;
	iterationCount = 0;
};

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
		renderer.clear();
		renderer.drawBackground();
		renderer.drawRoads();
		renderer.drawVehicles(roadNetwork);

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

},{"./raf":"/Users/ralphgerm/js/movsim-es6/src/js/raf.js","./renderer":"/Users/ralphgerm/js/movsim-es6/src/js/renderer.js","./resources":"/Users/ralphgerm/js/movsim-es6/src/js/resources.js","./roadNetwork":"/Users/ralphgerm/js/movsim-es6/src/js/roadNetwork.js","./roadNetworkFactory":"/Users/ralphgerm/js/movsim-es6/src/js/roadNetworkFactory.js","./roadSegment":"/Users/ralphgerm/js/movsim-es6/src/js/roadSegment.js"}],"/Users/ralphgerm/js/movsim-es6/src/js/idm.js":[function(require,module,exports){
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

},{}],"/Users/ralphgerm/js/movsim-es6/src/js/renderer.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var getImage = require("./resources").getImage;



// TODO replace fixed scale numbers
var scaleFactorImg = 1;
var center_x = 0.5 * 1000 * scaleFactorImg;
var center_y = 0.48 * 800 * scaleFactorImg;
var scale = 1.2;

var Renderer = (function () {
	function Renderer(network) {
		_classCallCheck(this, Renderer);

		this.roadNetwork = network;
		this.canvas = document.getElementById("animation-canvas");
		this.ctx = this.canvas.getContext("2d");

		var width = this.canvas.width = 1000; //backgroundImage.width;
		var height = this.canvas.height = 500; // backgroundImage.height;

		this.car = getImage("car1");
		this.truck = getImage("truck1");
	}

	_prototypeProperties(Renderer, null, {
		clear: {
			value: function clear() {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			},
			writable: true,
			configurable: true
		},
		drawBackground: {
			value: function drawBackground() {
				this.ctx.setTransform(1, 0, 0, 1, 0, 0);
				this.ctx.fillStyle = "#113366";

				this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			},
			writable: true,
			configurable: true
		},
		drawRoads: {
			value: function drawRoads() {},
			writable: true,
			configurable: true
		},
		drawVehicles: {
			value: function drawVehicles(roadNetwork) {
				for (var i = 0; i < roadNetwork.roadSegments.length; i++) {
					var roadSegment = roadNetwork.roadSegments[i];
					for (var j = 0; j < roadSegment.roadLanes.length; j++) {
						var roadLane = roadSegment.roadLanes[j];
						for (var k = 0; k < roadLane.vehicles.length; k++) {
							var vehicle = roadLane.vehicles[k];

							// TODO calculate correct screen coordinates from roadSegment geometry
							var x = vehicle.position; // ringroad !!
							var y = roadSegment.parameters.globalY;
							var vehImage = vehicle.isTruck ? this.truck : this.car;
							this.ctx.setTransform(1, 0, 0, 1, 0, 0);
							var scaleImg = scale * scaleFactorImg;
							this.ctx.drawImage(vehImage, x, y, scaleImg * 30, scaleImg * 20);
						}
					}
				}
			},
			writable: true,
			configurable: true
		}
	});

	return Renderer;
})();

module.exports = Renderer;

},{"./resources":"/Users/ralphgerm/js/movsim-es6/src/js/resources.js"}],"/Users/ralphgerm/js/movsim-es6/src/js/resources.js":[function(require,module,exports){
"use strict";

/**
 * Loads all images declared in sources variable and stores them in images variable.
 * After all images are loaded the callback function is called.
 * @param {Function} callback - Called when all images are loaded.
 */
exports.loadResources = loadResources;
exports.getImage = getImage;
var images = {};
var sources = {
	car1: "../img/carSmall2.png",
	truck1: "../img/truck1Small.png",
	ringRoadOneLane: "../img/oneLanesRoadRealistic_wideBoundaries_cropped2.png"
};function loadResources(callback) {
	var loadedImages = 0;
	var numImagesToLoad = Object.keys(sources).length;
	for (var src in sources) {
		images[src] = new Image();
		images[src].onload = function () {
			loadedImages++;
			if (loadedImages >= numImagesToLoad) {
				callback();
			}
		};
		images[src].src = sources[src];
	}
};

function getImage(imgName) {
	if (images[imgName]) {
		return images[imgName];
	}
	debugger;
	throw new Error(imgName + " image not defined in movsim.ressources");
};
Object.defineProperty(exports, "__esModule", {
	value: true
});

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
        for (var _iterator = this.roadSegments[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
          var roadSegment = _step.value;
          roadSegment.considerLaneChanges(dt);
        }

        for (var _iterator2 = this.roadSegments[Symbol.iterator](), _step2; !(_step2 = _iterator2.next()).done;) {
          var roadSegment = _step2.value;
          roadSegment.updateVehicleAccelerations(dt);
        }

        for (var _iterator3 = this.roadSegments[Symbol.iterator](), _step3; !(_step3 = _iterator3.next()).done;) {
          var roadSegment = _step3.value;
          roadSegment.updateVehiclePositionsAndSpeeds(dt);
        }

        for (var _iterator4 = this.roadSegments[Symbol.iterator](), _step4; !(_step4 = _iterator4.next()).done;) {
          var roadSegment = _step4.value;
          roadSegment.checkForInconsistencies(dt);
        }

        for (var _iterator5 = this.roadSegments[Symbol.iterator](), _step5; !(_step5 = _iterator5.next()).done;) {
          var roadSegment = _step5.value;
          roadSegment.updateOutflow(dt);
        }

        for (var _iterator6 = this.roadSegments[Symbol.iterator](), _step6; !(_step6 = _iterator6.next()).done;) {
          var roadSegment = _step6.value;
          roadSegment.updateInflow(dt);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcmFscGhnZXJtL2pzL21vdnNpbS1lczYvc3JjL2pzL21haW4uanMiLCIvVXNlcnMvcmFscGhnZXJtL2pzL21vdnNpbS1lczYvc3JjL2pzL2lkbS5qcyIsIi9Vc2Vycy9yYWxwaGdlcm0vanMvbW92c2ltLWVzNi9zcmMvanMvbW9kZWxzLmpzIiwiL1VzZXJzL3JhbHBoZ2VybS9qcy9tb3ZzaW0tZXM2L3NyYy9qcy9yYWYuanMiLCIvVXNlcnMvcmFscGhnZXJtL2pzL21vdnNpbS1lczYvc3JjL2pzL3JlbmRlcmVyLmpzIiwiL1VzZXJzL3JhbHBoZ2VybS9qcy9tb3ZzaW0tZXM2L3NyYy9qcy9yZXNvdXJjZXMuanMiLCIvVXNlcnMvcmFscGhnZXJtL2pzL21vdnNpbS1lczYvc3JjL2pzL3JvYWRMYW5lLmpzIiwiL1VzZXJzL3JhbHBoZ2VybS9qcy9tb3ZzaW0tZXM2L3NyYy9qcy9yb2FkTmV0d29yay5qcyIsIi9Vc2Vycy9yYWxwaGdlcm0vanMvbW92c2ltLWVzNi9zcmMvanMvcm9hZE5ldHdvcmtGYWN0b3J5LmpzIiwiL1VzZXJzL3JhbHBoZ2VybS9qcy9tb3ZzaW0tZXM2L3NyYy9qcy9yb2FkU2VnbWVudC5qcyIsIi9Vc2Vycy9yYWxwaGdlcm0vanMvbW92c2ltLWVzNi9zcmMvanMvdmVoaWNsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7SUNDQyxjQUFjLFdBRVYsc0JBQXNCLEVBRjFCLGNBQWM7SUFHUixXQUFXLDJCQUFNLGVBQWU7O0lBQ2hDLFdBQVcsMkJBQU0sZUFBZTs7SUFDaEMsR0FBRywyQkFBTSxPQUFPOztJQUNoQixRQUFRLDJCQUFNLFlBQVk7O0lBRWhDLGFBQWEsV0FFVCxhQUFhLEVBRmpCLGFBQWE7Ozs7O0FBTWQsR0FBRyxFQUFFLENBQUM7OztBQUdOLElBQUksRUFBRSxHQUFHLEdBQUcs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QUcsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUN4RSxxQkFBcUIsRUFBRSxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUMxRDs7OztBQUVELHdCQUFzQjtVQUFBLGdDQUFDLEVBQUUsRUFBRTtBQUMxQixRQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDNUQsUUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUM1QixRQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO0FBQ25CLFNBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0tBQ2Y7O0FBQUEsSUFFRDs7Ozs7O1FBNURtQixPQUFPOzs7aUJBQVAsT0FBTyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge1xuXHRjcmVhdGVSaW5nUm9hZFxufVxuZnJvbSAnLi9yb2FkTmV0d29ya0ZhY3RvcnknO1xuaW1wb3J0IFJvYWROZXR3b3JrIGZyb20gJy4vcm9hZE5ldHdvcmsnO1xuaW1wb3J0IFJvYWRTZWdtZW50IGZyb20gJy4vcm9hZFNlZ21lbnQnO1xuaW1wb3J0IHJhZiBmcm9tICcuL3JhZic7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi9yZW5kZXJlcic7XG5pbXBvcnQge1xuXHRsb2FkUmVzb3VyY2VzXG59XG5mcm9tICcuL3Jlc291cmNlcyc7XG5cblxuLy8gcG9seWZpbGwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5yYWYoKTtcblxuLy8gZHQgaXMgZHluYW1pY2FsbHkgY2hhbmdlZC4gU2VlIG1haW5Mb29wLlxubGV0IGR0ID0gMC4yO1xubGV0IHNpbXVsYXRpb25UaW1lID0gMDtcbmxldCBpdGVyYXRpb25Db3VudCA9IDA7XG5cbmxldCBydW5uaW5nID0gZmFsc2U7XG5sZXQgdGltZTtcbmxldCB0aW1lV2FycCA9IDQ7XG5cbmxldCByZW5kZXJlcjtcbmxldCByb2FkTmV0d29yaztcblxubG9hZFJlc291cmNlcyhmdW5jdGlvbigpIHtcblx0bGV0IHJvYWRMZW5ndGggPSAxMDAwO1xuXHRsZXQgbnVtYmVyT2ZMYW5lcyA9IDE7XG5cdHJvYWROZXR3b3JrID0gY3JlYXRlUmluZ1JvYWQocm9hZExlbmd0aCwgbnVtYmVyT2ZMYW5lcyk7XG5cblx0cmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIocm9hZE5ldHdvcmspO1xuXHRyZW5kZXJlci5kcmF3Um9hZHMoKTtcblx0cmVuZGVyZXIuZHJhd0JhY2tncm91bmQoKTtcblxuXHRzdGFydCgpO1xufSk7XG5cbmZ1bmN0aW9uIHN0YXJ0KCkge1xuXHRydW5uaW5nID0gdHJ1ZTtcblx0dGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRtYWluTG9vcCgpO1xufVxuXG5mdW5jdGlvbiBzdG9wKCkge1xuXHRydW5uaW5nID0gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiByZXNldCgpIHtcblx0ZHQgPSAwLjI7XG5cdHNpbXVsYXRpb25UaW1lID0gMDtcblx0aXRlcmF0aW9uQ291bnQgPSAwO1xufTtcblxuZnVuY3Rpb24gbWFpbkxvb3AoKSB7XG5cdGlmIChydW5uaW5nKSB7XG5cblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFpbkxvb3ApO1xuXG5cdFx0dmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcdGR0ID0gKG5vdyAtICh0aW1lIHx8IG5vdykpIC8gMTAwMDtcblx0XHRkdCAqPSB0aW1lV2FycDtcblx0XHR0aW1lID0gbm93O1xuXG5cdFx0Ly8gdXBkYXRlIHN0YXRlXG5cdFx0c2ltdWxhdGlvblRpbWUgKz0gZHQ7XG5cdFx0aXRlcmF0aW9uQ291bnQrKztcblx0XHRyb2FkTmV0d29yay50aW1lU3RlcChkdCk7XG5cblx0XHQvLyBkcmF3XG5cdFx0cmVuZGVyZXIuY2xlYXIoKTtcblx0XHRyZW5kZXJlci5kcmF3QmFja2dyb3VuZCgpO1xuXHRcdHJlbmRlcmVyLmRyYXdSb2FkcygpO1xuXHRcdHJlbmRlcmVyLmRyYXdWZWhpY2xlcyhyb2FkTmV0d29yayk7XG5cblx0XHQvLyBsaW1pdCBpdGVyYXRpb25zIGZvciBub3dcblx0XHRpZiAoaXRlcmF0aW9uQ291bnQgPj0gMTAwMCkge1xuXHRcdFx0cnVubmluZyA9IGZhbHNlO1xuXG5cdFx0XHRyb2FkTmV0d29yay5yb2FkU2VnbWVudHNbMF0ucm9hZExhbmVzWzBdLnZlaGljbGVzLmZvckVhY2goZnVuY3Rpb24odmVoaWNsZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygndmVoaWNsZTogJywgdmVoaWNsZS5pZCwgJyAgcG9zOiAnLCB2ZWhpY2xlLnBvc2l0aW9uLnRvRml4ZWQoXG5cdFx0XHRcdFx0MiksICcgIHNwZWVkOiAnLCB2ZWhpY2xlLnNwZWVkLnRvRml4ZWQoMiksICcgIGFjYzogJywgdmVoaWNsZS5hY2MudG9GaXhlZChcblx0XHRcdFx0XHQ0KSwgJyAgIGE6ICcsIHZlaGljbGUuY2FyRm9sbG93aW5nTW9kZWxQYXJhbWV0ZXJzLmEpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKGl0ZXJhdGlvbkNvdW50ICUgMTAwID09PSAwKSB7XG5cdFx0XHRjb25zb2xlLmxvZygndGltZVN0ZXA6ICcsIGR0LCAnIC0tIHNpbVRpbWU6ICcsIHNpbXVsYXRpb25UaW1lLFxuXHRcdFx0XHQnIC0tIGl0ZXJhdGlvbmNvdW50OiAnLCBpdGVyYXRpb25Db3VudCk7XG5cblx0XHRcdHJvYWROZXR3b3JrLnJvYWRTZWdtZW50c1swXS5yb2FkTGFuZXNbMF0udmVoaWNsZXMuZm9yRWFjaChmdW5jdGlvbih2ZWhpY2xlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCd2ZWhpY2xlOiAnLCB2ZWhpY2xlLmlkLCAnICBwb3M6ICcsIHZlaGljbGUucG9zaXRpb24udG9GaXhlZChcblx0XHRcdFx0XHQyKSwgJyAgc3BlZWQ6ICcsIHZlaGljbGUuc3BlZWQudG9GaXhlZCgyKSwgJyAgYWNjOiAnLCB2ZWhpY2xlLmFjYy50b0ZpeGVkKFxuXHRcdFx0XHRcdDQpLCAnICAgYTogJywgdmVoaWNsZS5jYXJGb2xsb3dpbmdNb2RlbFBhcmFtZXRlcnMuYSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblxuXHR9IGVsc2Uge1xuXHRcdGNvbnNvbGUubG9nKCd0aW1lU3RlcDogJywgZHQsICcgLS0gc2ltVGltZTogJywgc2ltdWxhdGlvblRpbWUsXG5cdFx0XHQnIC0tIGl0ZXJhdGlvbmNvdW50OiAnLCBpdGVyYXRpb25Db3VudCk7XG5cdH1cblxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgSWRtUGFyYW1ldGVycyB7XG5cbiAgY29uc3RydWN0b3IodjAgPSAyMCwgYSA9IDEuMiwgYiA9IDEuMiwgVCA9IDEuNSwgczAgPSAyLCBzMSA9IDAsIGRlbHRhID0gNCkge1xuICAgIHRoaXMudjAgPSB2MDtcbiAgICB0aGlzLmEgPSBhO1xuICAgIHRoaXMuYiA9IGI7XG4gICAgdGhpcy5UID0gVDtcbiAgICB0aGlzLnMwID0gczA7XG4gICAgdGhpcy5zMSA9IHMxO1xuICAgIHRoaXMuZGVsdGEgPSBkZWx0YTtcbiAgfVxuXG4gIHN0YXRpYyBnZXREZWZhdWx0Q2FyKCkge1xuICAgIHJldHVybiBuZXcgSWRtUGFyYW1ldGVycygpO1xuICB9O1xuXG4gIHN0YXRpYyBnZXREZWZhdWx0VHJ1Y2soKSB7XG4gICAgbGV0IGRlZmF1bHRUcnVjayA9IG5ldyBJZG1QYXJhbWV0ZXJzKCk7XG4gICAgZGVmYXVsdFRydWNrLnYwID0gMC44ICogZGVmYXVsdFRydWNrLnYwO1xuICAgIGRlZmF1bHRUcnVjay5hID0gMC44ICogZGVmYXVsdFRydWNrLmE7XG4gICAgZGVmYXVsdFRydWNrLlQgPSAxLjIgKiBkZWZhdWx0VHJ1Y2suVDtcbiAgICByZXR1cm4gZGVmYXVsdFRydWNrO1xuICB9O1xuXG59XG4iLCJpbXBvcnQgSWRtUGFyYW1ldGVycyBmcm9tICcuL2lkbSc7XG5cblxubGV0IG1heERlY2VsZXJhdGlvbiA9IDIwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbHMge1xuXG5cdHN0YXRpYyBpZG1DYWxjQWNjKHMsIHYsIHZsLCB2MGVmZiwgcGFyYW1ldGVycykge1xuXHRcdGxldCBhY2NGcmVlID0gcGFyYW1ldGVycy5hICogKDEgLSBNYXRoLnBvdyh2IC8gdjBlZmYsIHBhcmFtZXRlcnMuZGVsdGEpKTtcblx0XHRsZXQgc3N0YXIgPSBwYXJhbWV0ZXJzLnMwICsgdiAqIHBhcmFtZXRlcnMuVCArIHBhcmFtZXRlcnMuczEgKiBNYXRoLnNxcnQoKHYgK1xuXHRcdFx0MC4wMDAxKSAvIHYwZWZmKSArIDAuNSAqIHYgKiAodiAtIHZsKSAvIE1hdGguc3FydChwYXJhbWV0ZXJzLmEgKlxuXHRcdFx0cGFyYW1ldGVycy5iKTtcblx0XHRsZXQgYWNjSW50ID0gLXBhcmFtZXRlcnMuYSAqIE1hdGgucG93KHNzdGFyIC8gTWF0aC5tYXgocywgcGFyYW1ldGVycy5zMCksIDIpO1xuXHRcdHJldHVybiBNYXRoLm1heCgtbWF4RGVjZWxlcmF0aW9uLCBhY2NGcmVlICsgYWNjSW50KTtcblx0fVxuXG5cdHN0YXRpYyBjYWxjdWxhdGVBY2NlbGVyYXRpb24ocywgdiwgdmwsIHYwZWZmLCBwYXJhbWV0ZXJzKSB7XG5cdFx0Ly8gVE9ETyBjaGVjayBlZmZlY3RpdmUgc3BlZWQgb2YgaW5zdGFuY2VvZiBjYWxsXG5cdFx0aWYgKHBhcmFtZXRlcnMgaW5zdGFuY2VvZiBJZG1QYXJhbWV0ZXJzKSB7XG5cdFx0XHRyZXR1cm4gTW9kZWxzLmlkbUNhbGNBY2MocywgdiwgdmwsIHYwZWZmLCBwYXJhbWV0ZXJzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgRXJyb3IoXCJjYW5ub3QgbWFwIHBhcmFtZXRlcnMgdG8gYWNjZWxlcmF0aW9uIGZ1bmN0aW9uXCIgKyBwYXJhbWV0ZXJzLnRvU3RyaW5nKCkpO1xuXHRcdH1cblx0fTtcbn1cbiIsIi8vIGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXG4vLyBodHRwOi8vbXkub3BlcmEuY29tL2Vtb2xsZXIvYmxvZy8yMDExLzEyLzIwL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtZXItYW5pbWF0aW5nXG5cbi8vIHJlcXVlc3RBbmltYXRpb25GcmFtZSBwb2x5ZmlsbCBieSBFcmlrIE3DtmxsZXJcbi8vIGZpeGVzIGZyb20gUGF1bCBJcmlzaCBhbmQgVGlubyBaaWpkZWxcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmFmKCkge1xuXHR2YXIgbGFzdFRpbWUgPSAwO1xuXHR2YXIgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ107XG5cdGZvciAodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcblx0XHR3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSArICdDYW5jZWxBbmltYXRpb25GcmFtZSddIHx8XG5cdFx0XHR3aW5kb3dbdmVuZG9yc1t4XSArICdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcblx0fVxuXG5cdGlmICghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSlcblx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2ssIGVsZW1lbnQpIHtcblx0XHRcdHZhciBjdXJyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcdFx0dmFyIHRpbWVUb0NhbGwgPSBNYXRoLm1heCgwLCAxNiAtIChjdXJyVGltZSAtIGxhc3RUaW1lKSk7XG5cdFx0XHR2YXIgaWQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0aW1lVG9DYWxsKTtcblx0XHRcdGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuXHRcdFx0cmV0dXJuIGlkO1xuXHRcdH07XG5cblx0aWYgKCF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpXG5cdFx0d2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcblx0XHRcdGNsZWFyVGltZW91dChpZCk7XG5cdFx0fTtcblxuXHRjb25zb2xlLmxvZygncmVxdWVzdEFuaW1hdGlvbkZyYW1lIHNldDogJywgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSk7XG59XG4iLCJpbXBvcnQge1xuXHRnZXRJbWFnZVxufVxuZnJvbSAnLi9yZXNvdXJjZXMnO1xuXG5cbi8vIFRPRE8gcmVwbGFjZSBmaXhlZCBzY2FsZSBudW1iZXJzXG52YXIgc2NhbGVGYWN0b3JJbWcgPSAxO1xudmFyIGNlbnRlcl94ID0gMC41MCAqIDEwMDAgKiBzY2FsZUZhY3RvckltZztcbnZhciBjZW50ZXJfeSA9IDAuNDggKiA4MDAgKiBzY2FsZUZhY3RvckltZztcbnZhciBzY2FsZSA9IDEuMjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyZXIge1xuXG5cdGNvbnN0cnVjdG9yKG5ldHdvcmspIHtcblx0XHR0aGlzLnJvYWROZXR3b3JrID0gbmV0d29yaztcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYW5pbWF0aW9uLWNhbnZhc1wiKTtcblx0XHR0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuXHRcdGxldCB3aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoID0gMTAwMDsgLy9iYWNrZ3JvdW5kSW1hZ2Uud2lkdGg7XG5cdFx0bGV0IGhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IDUwMDsgLy8gYmFja2dyb3VuZEltYWdlLmhlaWdodDtcblxuXHRcdHRoaXMuY2FyID0gZ2V0SW1hZ2UoJ2NhcjEnKTtcblx0XHR0aGlzLnRydWNrID0gZ2V0SW1hZ2UoJ3RydWNrMScpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuXHR9O1xuXG5cdGRyYXdCYWNrZ3JvdW5kKCkge1xuXHRcdHRoaXMuY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcblx0XHR0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiMxMTMzNjZcIjtcblxuXHRcdHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuXHR9XG5cblx0ZHJhd1JvYWRzKCkge1xuXG5cdH1cblxuXHRkcmF3VmVoaWNsZXMocm9hZE5ldHdvcmspIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJvYWROZXR3b3JrLnJvYWRTZWdtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IHJvYWRTZWdtZW50ID0gcm9hZE5ldHdvcmsucm9hZFNlZ21lbnRzW2ldO1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCByb2FkU2VnbWVudC5yb2FkTGFuZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0bGV0IHJvYWRMYW5lID0gcm9hZFNlZ21lbnQucm9hZExhbmVzW2pdO1xuXHRcdFx0XHRmb3IgKGxldCBrID0gMDsgayA8IHJvYWRMYW5lLnZlaGljbGVzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdFx0bGV0IHZlaGljbGUgPSByb2FkTGFuZS52ZWhpY2xlc1trXTtcblxuXHRcdFx0XHRcdC8vIFRPRE8gY2FsY3VsYXRlIGNvcnJlY3Qgc2NyZWVuIGNvb3JkaW5hdGVzIGZyb20gcm9hZFNlZ21lbnQgZ2VvbWV0cnlcblx0XHRcdFx0XHR2YXIgeCA9IHZlaGljbGUucG9zaXRpb247IC8vIHJpbmdyb2FkICEhXG5cdFx0XHRcdFx0dmFyIHkgPSByb2FkU2VnbWVudC5wYXJhbWV0ZXJzLmdsb2JhbFk7XG5cdFx0XHRcdFx0dmFyIHZlaEltYWdlID0gdmVoaWNsZS5pc1RydWNrID8gdGhpcy50cnVjayA6IHRoaXMuY2FyO1xuXHRcdFx0XHRcdHRoaXMuY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcblx0XHRcdFx0XHR2YXIgc2NhbGVJbWcgPSBzY2FsZSAqIHNjYWxlRmFjdG9ySW1nO1xuXHRcdFx0XHRcdHRoaXMuY3R4LmRyYXdJbWFnZSh2ZWhJbWFnZSwgeCwgeSwgc2NhbGVJbWcgKiAzMCwgc2NhbGVJbWcgKiAyMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxufVxuIiwidmFyIGltYWdlcyA9IHt9O1xudmFyIHNvdXJjZXMgPSB7XG5cdGNhcjE6ICcuLi9pbWcvY2FyU21hbGwyLnBuZycsXG5cdHRydWNrMTogJy4uL2ltZy90cnVjazFTbWFsbC5wbmcnLFxuXHRyaW5nUm9hZE9uZUxhbmU6ICcuLi9pbWcvb25lTGFuZXNSb2FkUmVhbGlzdGljX3dpZGVCb3VuZGFyaWVzX2Nyb3BwZWQyLnBuZydcbn07XG5cbi8qKlxuICogTG9hZHMgYWxsIGltYWdlcyBkZWNsYXJlZCBpbiBzb3VyY2VzIHZhcmlhYmxlIGFuZCBzdG9yZXMgdGhlbSBpbiBpbWFnZXMgdmFyaWFibGUuXG4gKiBBZnRlciBhbGwgaW1hZ2VzIGFyZSBsb2FkZWQgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGVkIHdoZW4gYWxsIGltYWdlcyBhcmUgbG9hZGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZFJlc291cmNlcyhjYWxsYmFjaykge1xuXHR2YXIgbG9hZGVkSW1hZ2VzID0gMDtcblx0dmFyIG51bUltYWdlc1RvTG9hZCA9IE9iamVjdC5rZXlzKHNvdXJjZXMpLmxlbmd0aDtcblx0Zm9yICh2YXIgc3JjIGluIHNvdXJjZXMpIHtcblx0XHRpbWFnZXNbc3JjXSA9IG5ldyBJbWFnZSgpO1xuXHRcdGltYWdlc1tzcmNdLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9hZGVkSW1hZ2VzKys7XG5cdFx0XHRpZiAobG9hZGVkSW1hZ2VzID49IG51bUltYWdlc1RvTG9hZCkge1xuXHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0aW1hZ2VzW3NyY10uc3JjID0gc291cmNlc1tzcmNdO1xuXHR9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW1hZ2UoaW1nTmFtZSkge1xuXHRpZiAoaW1hZ2VzW2ltZ05hbWVdKSB7XG5cdFx0cmV0dXJuIGltYWdlc1tpbWdOYW1lXTtcblx0fVxuXHRkZWJ1Z2dlcjtcblx0dGhyb3cgbmV3IEVycm9yKGltZ05hbWUgKyAnIGltYWdlIG5vdCBkZWZpbmVkIGluIG1vdnNpbS5yZXNzb3VyY2VzJyk7XG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9hZExhbmUge1xuXG4gIGNvbnN0cnVjdG9yKHJvYWRTZWdtZW50KSB7XG4gICAgdGhpcy52ZWhpY2xlcyA9IFtdO1xuICAgIHRoaXMucm9hZFNlZ21lbnQgPSByb2FkU2VnbWVudDtcbiAgICB0aGlzLnNpbmtMYW5lU2VnbWVudCA9IG51bGw7IC8vVE9ET1xuICAgIHRoaXMuc291cmNlTGFuZVNlZ21lbnQgPSBudWxsOyAvL1RPRE9cbiAgfVxuXG4gIGdldFJvYWRMZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMucm9hZFNlZ21lbnQucm9hZExlbmd0aDtcbiAgfTtcblxuICBhZGRWZWhpY2xlKHZlaGljbGUpIHtcbiAgICB0aGlzLnZlaGljbGVzLnB1c2godmVoaWNsZSk7XG4gIH07XG5cbiAgdXBkYXRlVmVoaWNsZUFjY2VsZXJhdGlvbnMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMudmVoaWNsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciB2ZWhpY2xlID0gdGhpcy52ZWhpY2xlc1tpXTtcbiAgICAgIHZlaGljbGUudXBkYXRlQWNjZWxlcmF0aW9uKHRoaXMpO1xuICAgIH1cbiAgfTtcblxuICB1cGRhdGVTcGVlZEFuZFBvc2l0aW9uKGR0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZlaGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmVoaWNsZSA9IHRoaXMudmVoaWNsZXNbaV07XG4gICAgICB2ZWhpY2xlLnVwZGF0ZVNwZWVkQW5kUG9zaXRpb24oZHQpO1xuICAgICAgaWYgKHRoaXMucm9hZFNlZ21lbnQucGFyYW1ldGVycy5yaW5nUm9hZCAmJiB2ZWhpY2xlLnBvc2l0aW9uID4gdGhpcy5yb2FkU2VnbWVudFxuICAgICAgICAucGFyYW1ldGVycy5yb2FkTGVuZ3RoKSB7XG4gICAgICAgIHZlaGljbGUucG9zaXRpb24gLT0gdGhpcy5yb2FkU2VnbWVudC5wYXJhbWV0ZXJzLnJvYWRMZW5ndGg7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGdldExhbmVSZWFyVmVoaWNsZSgpIHtcbiAgICBpZiAodGhpcy52ZWhpY2xlcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy52ZWhpY2xlc1t0aGlzLnZlaGljbGVzLmxlbmd0aCAtIDFdO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBnZXRMYW5lRnJvbnRWZWhpY2xlKCkge1xuICAgIGlmICh0aGlzLnZlaGljbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0aGlzLnZlaGljbGVzWzBdO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBnZXRSZWFyVmVoaWNsZShwb3NpdGlvbikge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX3Bvc2l0aW9uQmluYXJ5U2VhcmNoKHBvc2l0aW9uKTtcbiAgICB2YXIgaW5zZXJ0aW9uUG9pbnQgPSAtaW5kZXggLSAxO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAvLyBleGFjdCBtYXRjaCBmb3VuZCwgc28gcmV0dXJuIHRoZSBtYXRjaGVkIHZlaGljbGVcbiAgICAgIGlmIChpbmRleCA8IHRoaXMudmVoaWNsZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZlaGljbGVzW2luZGV4XTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZ2V0IG5leHQgdmVoaWNsZSBpZiBub3QgcGFzdCBlbmRcbiAgICAgIGlmIChpbnNlcnRpb25Qb2ludCA8IHRoaXMudmVoaWNsZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZlaGljbGVzW2luc2VydGlvblBvaW50XTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuc291cmNlTGFuZVNlZ21lbnQgIT09IG51bGwpIHtcbiAgICAgIC8vIGRpZG4ndCBmaW5kIGEgcmVhciB2ZWhpY2xlIGluIHRoZSBjdXJyZW50IHJvYWQgc2VnbWVudCwgc29cbiAgICAgIC8vIGNoZWNrIHRoZSBwcmV2aW91cyAoc291cmNlKSByb2FkIHNlZ21lbnRcbiAgICAgIC8vIGFuZCBjb250aW51ZSB1bnRpbCBhIHZlaGljbGUgaXMgZm91bmQgb3Igbm8gZnVydGhlciBzb3VyY2UgaXMgY29ubmVjdGVkIHRvIGxhbmVTZWdtZW50XG4gICAgICB2YXIgc291cmNlRnJvbnRWZWhpY2xlID0gbnVsbDtcbiAgICAgIHZhciBzb3VyY2UgPSB0aGlzLnNvdXJjZUxhbmVTZWdtZW50O1xuICAgICAgdmFyIGFjY3VtRGlzdGFuY2UgPSAwO1xuICAgICAgZG8ge1xuICAgICAgICBhY2N1bURpc3RhbmNlICs9IHNvdXJjZS5nZXRSb2FkTGVuZ3RoKCk7XG4gICAgICAgIHNvdXJjZUZyb250VmVoaWNsZSA9IHNvdXJjZS5sYW5lRnJvbnRWZWhpY2xlKCk7XG4gICAgICAgIHNvdXJjZSA9IHNvdXJjZS5zb3VyY2VMYW5lU2VnbWVudCgpO1xuICAgICAgfSB3aGlsZSAoc291cmNlRnJvbnRWZWhpY2xlID09PSBudWxsICYmIHNvdXJjZSAhPT0gbnVsbCk7XG4gICAgICBpZiAoc291cmNlRnJvbnRWZWhpY2xlICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHNvdXJjZUZyb250VmVoaWNsZS5nZXRGcm9udFBvc2l0aW9uKCkgLVxuICAgICAgICAgIGFjY3VtRGlzdGFuY2U7XG4gICAgICAgIHJldHVybiBtb3ZzaW0uc2ltdWxhdGlvbi5tb3ZlYWJsZS5jcmVhdGUoc291cmNlRnJvbnRWZWhpY2xlLFxuICAgICAgICAgIG5ld1Bvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgZ2V0RnJvbnRWZWhpY2xlKHBvc2l0aW9uKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fcG9zaXRpb25CaW5hcnlTZWFyY2gocG9zaXRpb24pO1xuICAgIHZhciBpbnNlcnRpb25Qb2ludCA9IC1pbmRleCAtIDE7XG4gICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgcmV0dXJuIHRoaXMudmVoaWNsZXNbaW5kZXggLSAxXTsgLy8gZXhhY3QgbWF0Y2ggZm91bmRcbiAgICB9IGVsc2UgaWYgKGluc2VydGlvblBvaW50ID4gMCkge1xuICAgICAgcmV0dXJuIHRoaXMudmVoaWNsZXNbaW5zZXJ0aW9uUG9pbnQgLSAxXTtcbiAgICB9XG4gICAgLy8gaW5kZXggPT0gMCBvciBpbnNlcnRpb25Qb2ludCA9PSAwXG4gICAgLy8gc3ViamVjdCB2ZWhpY2xlIGlzIGZyb250IHZlaGljbGUgb24gdGhpcyByb2FkIHNlZ21lbnQsIHNvIGNoZWNrIGZvciB2ZWhpY2xlc1xuICAgIC8vIG9uIHNpbmsgbGFuZSBzZWdtZW50XG4gICAgaWYgKHRoaXMuc2lua0xhbmVTZWdtZW50ICE9PSBudWxsKSB7XG4gICAgICB2YXIgc2lua1JlYXJWZWhpY2xlID0gbnVsbDtcbiAgICAgIHZhciBzaW5rID0gdGhpcy5zaW5rTGFuZVNlZ21lbnQ7XG4gICAgICB2YXIgYWNjdW1EaXN0YW5jZSA9IHRoaXMuZ2V0Um9hZExlbmd0aCgpO1xuICAgICAgZG8ge1xuICAgICAgICBzaW5rUmVhclZlaGljbGUgPSBzaW5rLnJlYXJWZWhpY2xlKCk7XG4gICAgICAgIGlmIChzaW5rUmVhclZlaGljbGUgPT09IG51bGwpIHtcbiAgICAgICAgICBhY2N1bURpc3RhbmNlICs9IHNpbmsuZ2V0Um9hZExlbmd0aCgpO1xuICAgICAgICB9XG4gICAgICAgIHNpbmsgPSBzaW5rLnNpbmtMYW5lU2VnbWVudCgpO1xuICAgICAgfSB3aGlsZSAoc2lua1JlYXJWZWhpY2xlID09PSBudWxsICYmIHNpbmsgIT09IG51bGwpO1xuICAgICAgaWYgKHNpbmtSZWFyVmVoaWNsZSAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgbmV3UG9zaXRpb24gPSBzaW5rUmVhclZlaGljbGUuZ2V0RnJvbnRQb3NpdGlvbigpICsgYWNjdW1EaXN0YW5jZTtcbiAgICAgICAgcmV0dXJuIG1vdnNpbS5zaW11bGF0aW9uLm1vdmVhYmxlLmNyZWF0ZShzaW5rUmVhclZlaGljbGUsIG5ld1Bvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgdXBkYXRlT3V0ZmxvdyhkdCkge1xuICAgIC8vIHJlbW92ZSB2ZWhpY2xlcyB3aXRoIHBvc2l0aW9uID4gdGhpcy5yb2FkU2VnbWVudC5yb2FkTGVuZ3RoIChsYXRlcjogYXNzaWduIHRvIGxpbmtlZCBsYW5lKVxuICAgIC8vIGZvciByaW5ncm9hZCBzZXQgdmVoaWNsZSBhdCBiZWdpbm5pbmcgb2YgbGFuZSAocGVyaW9kaWMgYm91bmRhcnkgY29uZGl0aW9ucylcbiAgICB2YXIgcm9hZExlbmd0aCA9IHRoaXMucm9hZFNlZ21lbnQucm9hZExlbmd0aDtcbiAgICB2YXIgdmVoaWNsZTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy52ZWhpY2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmVoaWNsZSA9IHRoaXMudmVoaWNsZXNbaV07XG4gICAgICBpZiAodmVoaWNsZS5wb3NpdGlvbiA+IHJvYWRMZW5ndGgpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgdGhpcy52ZWhpY2xlcy5yZW1vdmUoaSk7XG4gICAgICAgIC8vIHJpbmcgcm9hZCBzcGVjaWFsIGNhc2UgVE9ETyByZW1vdmVcbiAgICAgICAgdmVoaWNsZS5wb3NpdGlvbiAtPSByb2FkTGVuZ3RoO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9zb3J0VmVoaWNsZXMoKTtcbiAgfTtcblxuICB1cGRhdGVJbmZsb3coZHQpIHtcbiAgICAvLyBUT0RPXG4gIH07XG5cbiAgX3NvcnRWZWhpY2xlcygpIHtcbiAgICB0aGlzLnZlaGljbGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEucG9zaXRpb24gLSBiLnBvc2l0aW9uO1xuICAgIH0pO1xuICB9O1xuXG4gIGdldExlYWRlcih2ZWhpY2xlKSB7XG4gICAgdmFyIHZlaGljbGVJbmRleCA9IHRoaXMuX2dldFBvc2l0aW9uSW5BcnJheSh2ZWhpY2xlLmlkKTtcbiAgICBpZiAodGhpcy52ZWhpY2xlcy5sZW5ndGggPD0gMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICh2ZWhpY2xlSW5kZXggPT09IHRoaXMudmVoaWNsZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMucm9hZFNlZ21lbnQucmluZ1JvYWQgPT09IHRydWUgPyB0aGlzLnZlaGljbGVzWzBdIDogbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudmVoaWNsZXNbdmVoaWNsZUluZGV4ICsgMV07XG4gIH07XG5cbiAgX2dldFBvc2l0aW9uSW5BcnJheShpZCkge1xuICAgIC8vIFRPRE8gZXM2IC0+IGZpbmRJbmRleFxuICAgIHZhciBpbmRleCA9IHRoaXMudmVoaWNsZXMubWFwKGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gZWwuaWQ7XG4gICAgfSkuaW5kZXhPZihpZCk7XG4gICAgcmV0dXJuIGluZGV4O1xuICB9O1xuXG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBSb2FkTmV0d29yayB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yb2FkU2VnbWVudHMgPSBbXTtcbiAgICBjb25zb2xlLmxvZygnY29udHJ1Y3RvciBSb2FkTmV0d29yaycpXG4gIH1cblxuICBhZGRSb2FkU2VnbWVudChyb2FkU2VnbWVudCkge1xuICAgIHRoaXMucm9hZFNlZ21lbnRzLnB1c2gocm9hZFNlZ21lbnQpO1xuICAgIGNvbnNvbGUubG9nKCcgIGFkZGVkICcsIHJvYWRTZWdtZW50LCAnIHRvIHJvYWROZXR3b3JrJywgdGhpcy5yb2FkU2VnbWVudHMpO1xuICB9XG5cbiAgdGltZVN0ZXAoZHQpIHtcbiAgICBmb3IgKGxldCByb2FkU2VnbWVudCBvZiB0aGlzLnJvYWRTZWdtZW50cykge1xuICAgICAgcm9hZFNlZ21lbnQuY29uc2lkZXJMYW5lQ2hhbmdlcyhkdCk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgcm9hZFNlZ21lbnQgb2YgdGhpcy5yb2FkU2VnbWVudHMpIHtcbiAgICAgIHJvYWRTZWdtZW50LnVwZGF0ZVZlaGljbGVBY2NlbGVyYXRpb25zKGR0KTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCByb2FkU2VnbWVudCBvZiB0aGlzLnJvYWRTZWdtZW50cykge1xuICAgICAgcm9hZFNlZ21lbnQudXBkYXRlVmVoaWNsZVBvc2l0aW9uc0FuZFNwZWVkcyhkdCk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgcm9hZFNlZ21lbnQgb2YgdGhpcy5yb2FkU2VnbWVudHMpIHtcbiAgICAgIHJvYWRTZWdtZW50LmNoZWNrRm9ySW5jb25zaXN0ZW5jaWVzKGR0KTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCByb2FkU2VnbWVudCBvZiB0aGlzLnJvYWRTZWdtZW50cykge1xuICAgICAgcm9hZFNlZ21lbnQudXBkYXRlT3V0ZmxvdyhkdCk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgcm9hZFNlZ21lbnQgb2YgdGhpcy5yb2FkU2VnbWVudHMpIHtcbiAgICAgIHJvYWRTZWdtZW50LnVwZGF0ZUluZmxvdyhkdCk7XG4gICAgfVxuXG4gIH1cblxufVxuIiwiaW1wb3J0IFJvYWROZXR3b3JrIGZyb20gJy4vcm9hZE5ldHdvcmsnO1xuaW1wb3J0IFJvYWRTZWdtZW50IGZyb20gJy4vcm9hZFNlZ21lbnQnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmluZ1JvYWQocm9hZExlbmd0aCwgbnVtYmVyT2ZMYW5lcykge1xuICB2YXIgcm9hZE5ldHdvcmsgPSBuZXcgUm9hZE5ldHdvcmsoKTtcblxuICAvLyBjcmVhdGUgb25lIHJvYWRTZWN0aW9uIHJlcHJlc2VudGluZyBhIHJpbmcgcm9hZCAoYW50aS1jbG9ja3dpc2UgZHJpdmluZyBkaXJlY3Rpb24pXG4gIHZhciByb2FkU2VnbWVudFBhcmFtZXRlcnMgPSBSb2FkU2VnbWVudC5nZXREZWZhdWx0UGFyYW1ldGVycygpO1xuICByb2FkU2VnbWVudFBhcmFtZXRlcnMucmluZ1JvYWQgPSB0cnVlO1xuICByb2FkU2VnbWVudFBhcmFtZXRlcnMucm9hZExlbmd0aCA9IHJvYWRMZW5ndGg7XG4gIHJvYWRTZWdtZW50UGFyYW1ldGVycy5udW1iZXJPZkxhbmVzID0gbnVtYmVyT2ZMYW5lcztcbiAgcm9hZFNlZ21lbnRQYXJhbWV0ZXJzLmdsb2JhbFggPSAwO1xuICByb2FkU2VnbWVudFBhcmFtZXRlcnMuZ2xvYmFsWSA9IDIwMDtcbiAgcm9hZFNlZ21lbnRQYXJhbWV0ZXJzLmhlYWRpbmcgPSAwO1xuICByb2FkU2VnbWVudFBhcmFtZXRlcnMuY3VydmF0dXJlID0gMiAqIE1hdGguUEkgLyByb2FkTGVuZ3RoO1xuXG4gIHZhciByb2FkU2VnbWVudCA9IG5ldyBSb2FkU2VnbWVudChyb2FkU2VnbWVudFBhcmFtZXRlcnMpO1xuXG4gIHJvYWROZXR3b3JrLmFkZFJvYWRTZWdtZW50KHJvYWRTZWdtZW50KTtcbiAgcmV0dXJuIHJvYWROZXR3b3JrO1xufTtcbiIsImltcG9ydCBSb2FkTGFuZSBmcm9tICcuL3JvYWRMYW5lJztcbmltcG9ydCBWZWhpY2xlIGZyb20gJy4vdmVoaWNsZSc7XG5pbXBvcnQgSWRtUGFyYW1ldGVycyBmcm9tICcuL2lkbSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvYWRTZWdtZW50IHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0dGhpcy5wYXJhbWV0ZXJzID0gb3B0aW9ucztcblx0XHR0aGlzLnJvYWRMYW5lcyA9IFtdO1xuXHRcdHRoaXMubnVtYmVyT2ZMYW5lcyA9IG9wdGlvbnMubnVtYmVyT2ZMYW5lcztcblxuXHRcdGZvciAobGV0IGkgPSAxOyBpIDw9IHRoaXMubnVtYmVyT2ZMYW5lczsgaSsrKSB7XG5cdFx0XHRsZXQgcm9hZExhbmUgPSBuZXcgUm9hZExhbmUodGhpcyk7XG5cdFx0XHR0aGlzLnJvYWRMYW5lcy5wdXNoKHJvYWRMYW5lKTtcblx0XHR9XG5cblx0XHR2YXIgdmVoaWNsZXNJbk9uZUxhbmUgPSBvcHRpb25zLnJvYWRMZW5ndGggKiBvcHRpb25zLmluaXREZW5zaXR5UGVyTGFuZTtcblx0XHR2YXIgbnVtYmVyT2ZWZWhpY2xlcyA9IE1hdGguZmxvb3IodGhpcy5udW1iZXJPZkxhbmVzICogdmVoaWNsZXNJbk9uZUxhbmUpO1xuXHRcdHRoaXMuX2luaXRpYWxpemVWZWhpY2xlcyhudW1iZXJPZlZlaGljbGVzLCBvcHRpb25zLmluaXRUcnVja0ZyYWN0aW9uKTtcblxuXHRcdGNvbnNvbGUubG9nKCdjb25zdHJ1Y3RvciBSb2FkU2VnbWVudCcpO1xuXHR9XG5cblx0Y29uc2lkZXJMYW5lQ2hhbmdlcyhkdCkge31cblxuXHR1cGRhdGVWZWhpY2xlQWNjZWxlcmF0aW9ucyhkdCkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5udW1iZXJPZkxhbmVzOyBpKyspIHtcblx0XHRcdHRoaXMucm9hZExhbmVzW2ldLnVwZGF0ZVZlaGljbGVBY2NlbGVyYXRpb25zKGR0KTtcblx0XHR9XG5cdH1cblxuXHR1cGRhdGVWZWhpY2xlUG9zaXRpb25zQW5kU3BlZWRzKGR0KSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mTGFuZXM7IGkrKykge1xuXHRcdFx0dGhpcy5yb2FkTGFuZXNbaV0udXBkYXRlU3BlZWRBbmRQb3NpdGlvbihkdCk7XG5cdFx0fVxuXHR9XG5cblx0Y2hlY2tGb3JJbmNvbnNpc3RlbmNpZXMoZHQpIHtcblx0XHQvLyBUT0RPIGltcGxlbWVudCBjaGVjayBmb3IgbmVnYXRpdmUgdmVoaWNsZSBkaXN0YW5jZXNcblx0fVxuXG5cdHVwZGF0ZU91dGZsb3coZHQpIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubnVtYmVyT2ZMYW5lczsgaSsrKSB7XG5cdFx0XHR0aGlzLnJvYWRMYW5lc1tpXS51cGRhdGVPdXRmbG93KGR0KTtcblx0XHR9XG5cdH1cblxuXHR1cGRhdGVJbmZsb3coZHQpIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubnVtYmVyT2ZMYW5lczsgaSsrKSB7XG5cdFx0XHR0aGlzLnJvYWRMYW5lc1tpXS51cGRhdGVJbmZsb3coZHQpO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBnZXREZWZhdWx0UGFyYW1ldGVycygpIHtcblx0XHRsZXQgcm9hZFNlY3Rpb25QYXJhbWV0ZXJzID0ge307XG5cdFx0cm9hZFNlY3Rpb25QYXJhbWV0ZXJzLnJvYWRMZW5ndGggPSAxMDAwO1xuXHRcdHJvYWRTZWN0aW9uUGFyYW1ldGVycy5udW1iZXJPZkxhbmVzID0gMTtcblx0XHRyb2FkU2VjdGlvblBhcmFtZXRlcnMuaW5pdERlbnNpdHlQZXJMYW5lID0gMTAgLyAxMDAwO1xuXHRcdHJvYWRTZWN0aW9uUGFyYW1ldGVycy5pbml0VHJ1Y2tGcmFjdGlvbiA9IDAuMTtcblx0XHRyb2FkU2VjdGlvblBhcmFtZXRlcnMucmluZ1JvYWQgPSBmYWxzZTtcblx0XHRyb2FkU2VjdGlvblBhcmFtZXRlcnMuZ2xvYmFsWCA9IDA7XG5cdFx0cm9hZFNlY3Rpb25QYXJhbWV0ZXJzLmdsb2JhbFkgPSAwO1xuXHRcdHJvYWRTZWN0aW9uUGFyYW1ldGVycy5oZWFkaW5nID0gMDtcblx0XHRyb2FkU2VjdGlvblBhcmFtZXRlcnMuY3VydmF0dXJlID0gMDtcblx0XHRyb2FkU2VjdGlvblBhcmFtZXRlcnMubGFuZVdpZHRoID0gMTA7XG5cdFx0cmV0dXJuIHJvYWRTZWN0aW9uUGFyYW1ldGVycztcblx0fVxuXG5cdF9pbml0aWFsaXplVmVoaWNsZXMobnVtYmVyT2ZWZWhpY2xlcywgdHJ1Y2tGcmFjdGlvbikge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtYmVyT2ZWZWhpY2xlczsgaSsrKSB7XG5cdFx0XHR2YXIgdmVoaWNsZVBhcmFtZXRlcnMgPSBWZWhpY2xlLmdldERlZmF1bHRQYXJhbWV0ZXJzKCk7XG5cdFx0XHR2ZWhpY2xlUGFyYW1ldGVycy5pc1RydWNrID0gTWF0aC5yYW5kb20oKSA8IHRydWNrRnJhY3Rpb247XG5cdFx0XHQvLyBpbml0aWFsaXplIGFsbCB2ZWhpY2xlcyB3aXRoIHNhbWUgc3BlZWQgZGV0ZXJtaW5lZCBieSBzbG93ZXIgdHJ1Y2tzXG5cdFx0XHR2ZWhpY2xlUGFyYW1ldGVycy5zcGVlZCA9IDAuOCAqIElkbVBhcmFtZXRlcnMuZ2V0RGVmYXVsdFRydWNrKClcblx0XHRcdFx0LnYwO1xuXHRcdFx0dmVoaWNsZVBhcmFtZXRlcnMucG9zaXRpb24gPSBpICogMTAwOyAvLyBUT0RPIGluaXQgY29ycmVjdGx5XG5cdFx0XHR2YXIgdmVoaWNsZSA9IG5ldyBWZWhpY2xlKHZlaGljbGVQYXJhbWV0ZXJzKTtcblx0XHRcdHZhciBsYW5lID0gaSAlIHRoaXMucm9hZExhbmVzLmxlbmd0aDtcblx0XHRcdHRoaXMucm9hZExhbmVzW2xhbmVdLmFkZFZlaGljbGUodmVoaWNsZSk7XG5cdFx0fVxuXHR9O1xufVxuIiwiaW1wb3J0IElkbVBhcmFtZXRlcnMgZnJvbSAnLi9pZG0nO1xuaW1wb3J0IE1vZGVscyBmcm9tICcuL21vZGVscyc7XG5cbnZhciBudW1iZXJPZkNyZWF0ZWRWZWhpY2xlcyA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlaGljbGUge1xuXG5cdGNvbnN0cnVjdG9yKHZlaGljbGVQYXJhbWV0ZXJzKSB7XG5cdFx0dGhpcy52ZWhpY2xlUGFyYW1ldGVycyA9IHZlaGljbGVQYXJhbWV0ZXJzIHx8IGdldERlZmF1bHRQYXJhbWV0ZXJzKCk7XG5cblx0XHQvLyBwdWJsaWMgdmFyaWFibGVzXG5cdFx0dGhpcy5pZCA9ICsrbnVtYmVyT2ZDcmVhdGVkVmVoaWNsZXM7XG5cdFx0dGhpcy5pc1RydWNrID0gdmVoaWNsZVBhcmFtZXRlcnMuaXNUcnVjaztcblx0XHR0aGlzLmxlbmd0aCA9IHZlaGljbGVQYXJhbWV0ZXJzLmxlbmd0aDtcblx0XHR0aGlzLndpZHRoID0gdmVoaWNsZVBhcmFtZXRlcnMud2lkdGg7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IHZlaGljbGVQYXJhbWV0ZXJzLnBvc2l0aW9uO1xuXHRcdHRoaXMuc3BlZWQgPSB2ZWhpY2xlUGFyYW1ldGVycy5zcGVlZDtcblx0XHR0aGlzLmFjYyA9IHZlaGljbGVQYXJhbWV0ZXJzLmFjYztcblx0XHR0aGlzLmNhckZvbGxvd2luZ01vZGVsUGFyYW1ldGVycyA9IHZlaGljbGVQYXJhbWV0ZXJzLmlzVHJ1Y2sgPyBJZG1QYXJhbWV0ZXJzXG5cdFx0XHQuZ2V0RGVmYXVsdFRydWNrKCkgOiBJZG1QYXJhbWV0ZXJzLmdldERlZmF1bHRDYXIoKTtcblx0XHR0aGlzLnZMaW1pdCA9IHRoaXMuY2FyRm9sbG93aW5nTW9kZWxQYXJhbWV0ZXJzLnYwOyAvLyBpZiBlZmZlY3RpdmUgc3BlZWQgbGltaXRzLCB2TGltaXQ8djBcblx0XHR0aGlzLnZNYXggPSB0aGlzLmNhckZvbGxvd2luZ01vZGVsUGFyYW1ldGVycy52MDsgLy8gaWYgdmVoaWNsZSByZXN0cmljdHMgc3BlZWQsIHZNYXg8dkxpbWl0LCB2MFxuXHRcdGNvbnNvbGUubG9nKCdjb250cnVjdGVkIHZlaGljbGUgd2l0aDogJywgdGhpcy52ZWhpY2xlUGFyYW1ldGVycyxcblx0XHRcdHRoaXMuY2FyRm9sbG93aW5nTW9kZWxQYXJhbWV0ZXJzKTtcblx0fVxuXG5cdGdldFJlYXJQb3NpdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5wb3NpdGlvbiAtIDAuNSAqIHRoaXMubGVuZ3RoO1xuXHR9O1xuXG5cdGdldEZyb250UG9zaXRpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMucG9zaXRpb24gKyAwLjUgKiB0aGlzLmxlbmd0aDtcblx0fTtcblxuXHR1cGRhdGVBY2NlbGVyYXRpb24ocm9hZExhbmUpIHtcblx0XHQvLyAgICAgICAgdmFyIGxlYWRlck1vdmVhYmxlID0gcm9hZExhbmUuZ2V0RnJvbnRWZWhpY2xlKHRoaXMucG9zaXRpb24pO1xuXG5cdFx0dmFyIGxlYWRlck1vdmVhYmxlID0gcm9hZExhbmUuZ2V0TGVhZGVyKHRoaXMpO1xuXG5cdFx0Ly8gVE9ETyBpZiBubyBsZWFkZXIgZ2V0IGEgcHJlLWRlZmluZWQgTW92ZWFibGUgc2V0IHRvIGluZmluaXR5XG5cdFx0Ly9pZihsZWFkZXJNb3ZlYWJsZSA9PT0gbnVsbCl7XG5cdFx0Ly8gICAgbGVhZGVyTW92ZWFibGUgPSBNb3ZlYWJsZS5nZXRNb3ZlYWJsZUF0SW5maW5pdHkoKTtcblx0XHQvLyB9XG5cdFx0dmFyIGxlYWRlclBvc2l0aW9uID0gbGVhZGVyTW92ZWFibGUgPyBsZWFkZXJNb3ZlYWJsZS5wb3NpdGlvbiA6IDEwMDAwMDA7XG5cdFx0dmFyIGxlYWRlclNwZWVkID0gbGVhZGVyTW92ZWFibGUgPyBsZWFkZXJNb3ZlYWJsZS5zcGVlZCA6IDEwMDtcblx0XHR2YXIgbGVhZGVyTGVuZ3RoID0gbGVhZGVyTW92ZWFibGUgPyBsZWFkZXJNb3ZlYWJsZS5sZW5ndGggOiAwO1xuXHRcdHZhciBkaXN0YW5jZSA9IGxlYWRlclBvc2l0aW9uIC0gbGVhZGVyTGVuZ3RoIC0gdGhpcy5wb3NpdGlvbjtcblx0XHRpZiAoZGlzdGFuY2UgPCAwKSB7XG5cdFx0XHRkaXN0YW5jZSA9IDQwOyAvLyBUT0RPIGp1c3QgYSBoYWNrIGhlcmVcblx0XHRcdC8vdGhyb3cgbmV3IEVycm9yKCduZWdhdGl2ZSBkaXN0YW5jZScpO1xuXHRcdH1cblxuXHRcdHZhciBlZmZlY3RpdmVEZXNpcmVkU3BlZWQgPSBNYXRoLm1pbih0aGlzLmNhckZvbGxvd2luZ01vZGVsUGFyYW1ldGVycy52MCxcblx0XHRcdHRoaXMudkxpbWl0LCB0aGlzLnZNYXgpO1xuXHRcdHRoaXMuYWNjID0gTW9kZWxzLmNhbGN1bGF0ZUFjY2VsZXJhdGlvbihkaXN0YW5jZSwgdGhpcy5zcGVlZCwgbGVhZGVyU3BlZWQsXG5cdFx0XHRlZmZlY3RpdmVEZXNpcmVkU3BlZWQsIHRoaXMuY2FyRm9sbG93aW5nTW9kZWxQYXJhbWV0ZXJzKTtcblx0fTtcblxuXHR1cGRhdGVTcGVlZEFuZFBvc2l0aW9uKGR0KSB7XG5cdFx0dGhpcy5wb3NpdGlvbiArPSB0aGlzLnNwZWVkICogZHQgKyAwLjUgKiB0aGlzLmFjYyAqIGR0ICogZHQ7XG5cdFx0dGhpcy5zcGVlZCArPSB0aGlzLmFjYyAqIGR0O1xuXHRcdGlmICh0aGlzLnNwZWVkIDwgMCkge1xuXHRcdFx0dGhpcy5zcGVlZCA9IDA7XG5cdFx0fVxuXHRcdC8vICAgICAgICBjb25zb2xlLmxvZygndmVoaWNsZSAnLCB0aGlzLmlkLCAnICAgcG9zaXRpb246ICcsIHRoaXMucG9zaXRpb24sICcgICBzcGVlZDogJywgdGhpcy5zcGVlZCwgJyAgICBhY2M6ICcsIHRoaXMuYWNjKTtcblx0fTtcblxuXHRzdGF0aWMgZ2V0RGVmYXVsdFBhcmFtZXRlcnMoaXNUcnVjayA9IGZhbHNlKSB7XG5cdFx0bGV0IHZlaGljbGVQYXJhbWV0ZXJzID0ge307XG5cdFx0dmVoaWNsZVBhcmFtZXRlcnMuaXNUcnVjayA9IGlzVHJ1Y2s7XG5cdFx0dmVoaWNsZVBhcmFtZXRlcnMubGVuZ3RoID0gKGlzVHJ1Y2spID8gMTUgOiA3O1xuXHRcdHZlaGljbGVQYXJhbWV0ZXJzLndpZHRoID0gKGlzVHJ1Y2spID8gMyA6IDIuNTtcblx0XHR2ZWhpY2xlUGFyYW1ldGVycy5wb3NpdGlvbiA9IDA7XG5cdFx0dmVoaWNsZVBhcmFtZXRlcnMuc3BlZWQgPSAwO1xuXHRcdHZlaGljbGVQYXJhbWV0ZXJzLmFjYyA9IDA7XG5cdFx0cmV0dXJuIHZlaGljbGVQYXJhbWV0ZXJzO1xuXHR9O1xufVxuIl19
