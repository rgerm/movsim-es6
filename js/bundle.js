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
var center_x = 0.5 * 800 * scaleFactorImg;
var center_y = 0.48 * 800 * scaleFactorImg;
var scale = 1.2;

var Renderer = (function () {
	function Renderer(network) {
		_classCallCheck(this, Renderer);

		this.roadNetwork = network;
		this.canvas = document.getElementById("animation-canvas");
		this.ctx = this.canvas.getContext("2d");

		var width = this.canvas.width = 800; //backgroundImage.width;
		var height = this.canvas.height = 800; // backgroundImage.height;

		this.car = getImage("car1");
		this.truck = getImage("truck1");
		debugger;
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
				// let roadSegments = roadNetwork.roadSegments[0];
				debugger;
				for (var i = 0; i < roadNetwork.roadSegments.length; i++) {
					var roadSegment = roadNetwork.roadSegments[i];
					for (var j = 0; j < roadSegment.roadLanes.length; j++) {
						var roadLane = roadSegment.roadLanes[j];
						for (var k = 0; k < roadLane.vehicles.length; k++) {
							var vehicle = roadLane.vehicles[k];
							// create graphical objects representing the vehicle occupation
							//                        vehPix[index]=new vehPix_cstr(vehicle);
							//
							////                    for(var i=0; i<n; i++){
							//                        var veh_len=vehicle.length;
							//                        var veh_w= vehicle.width;
							//                        var x=vehPix[index].x;
							//                        var y=vehPix[index].y;
							//                        var sinphi=vehPix[index].sphi;
							//                        var cosphi=vehPix[index].cphi;
							//
							//                        ctx.setTransform(cosphi, sinphi, -sinphi, cosphi, x, y);
							//                        var vehImage = vehicle.isTruck ? truck : car;
							//                        ctx.drawImage(vehImage, -0.5*veh_len, -0.5* veh_w, veh_len, veh_w);
							//                    }

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
				// roadNetwork.roadSegments.forEach(function(roadSection) {
				// 	roadSection.roadLanes.forEach(function(roadLane) {
				// 		roadLane.vehicles.forEach(function(vehicle, index) {
				//
				// 			// create graphical objects representing the vehicle occupation
				// 			//                        vehPix[index]=new vehPix_cstr(vehicle);
				// 			//
				// 			////                    for(var i=0; i<n; i++){
				// 			//                        var veh_len=vehicle.length;
				// 			//                        var veh_w= vehicle.width;
				// 			//                        var x=vehPix[index].x;
				// 			//                        var y=vehPix[index].y;
				// 			//                        var sinphi=vehPix[index].sphi;
				// 			//                        var cosphi=vehPix[index].cphi;
				// 			//
				// 			//                        ctx.setTransform(cosphi, sinphi, -sinphi, cosphi, x, y);
				// 			//                        var vehImage = vehicle.isTruck ? truck : car;
				// 			//                        ctx.drawImage(vehImage, -0.5*veh_len, -0.5* veh_w, veh_len, veh_w);
				// 			//                    }
				//
				// 			// TODO calculate correct screen coordinates from roadSegment geometry
				// 			var x = vehicle.position; // ringroad !!
				// 			var y = roadSection.parameters.globalY;
				// 			var vehImage = vehicle.isTruck ? this.truck : this.car;
				// 			this.ctx.setTransform(1, 0, 0, 1, 0, 0);
				// 			var scaleImg = scale * scaleFactorImg;
				// 			this.ctx.drawImage(vehImage, x, y, scaleImg * 30, scaleImg * 20);
				// 		});
				// 	});
				// });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcmFscGhnZXJtL2pzL21vdnNpbS1lczYvc3JjL2pzL21haW4uanMiLCIvVXNlcnMvcmFscGhnZXJtL2pzL21vdnNpbS1lczYvc3JjL2pzL2lkbS5qcyIsIi9Vc2Vycy9yYWxwaGdlcm0vanMvbW92c2ltLWVzNi9zcmMvanMvbW9kZWxzLmpzIiwiL1VzZXJzL3JhbHBoZ2VybS9qcy9tb3ZzaW0tZXM2L3NyYy9qcy9yYWYuanMiLCIvVXNlcnMvcmFscGhnZXJtL2pzL21vdnNpbS1lczYvc3JjL2pzL3JlbmRlcmVyLmpzIiwiL1VzZXJzL3JhbHBoZ2VybS9qcy9tb3ZzaW0tZXM2L3NyYy9qcy9yZXNvdXJjZXMuanMiLCIvVXNlcnMvcmFscGhnZXJtL2pzL21vdnNpbS1lczYvc3JjL2pzL3JvYWRMYW5lLmpzIiwiL1VzZXJzL3JhbHBoZ2VybS9qcy9tb3ZzaW0tZXM2L3NyYy9qcy9yb2FkTmV0d29yay5qcyIsIi9Vc2Vycy9yYWxwaGdlcm0vanMvbW92c2ltLWVzNi9zcmMvanMvcm9hZE5ldHdvcmtGYWN0b3J5LmpzIiwiL1VzZXJzL3JhbHBoZ2VybS9qcy9tb3ZzaW0tZXM2L3NyYy9qcy9yb2FkU2VnbWVudC5qcyIsIi9Vc2Vycy9yYWxwaGdlcm0vanMvbW92c2ltLWVzNi9zcmMvanMvdmVoaWNsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7SUNDQyxjQUFjLFdBRVYsc0JBQXNCLEVBRjFCLGNBQWM7SUFHUixXQUFXLDJCQUFNLGVBQWU7O0lBQ2hDLFdBQVcsMkJBQU0sZUFBZTs7SUFDaEMsR0FBRywyQkFBTSxPQUFPOztJQUNoQixRQUFRLDJCQUFNLFlBQVk7O0lBRWhDLGFBQWEsV0FFVCxhQUFhLEVBRmpCLGFBQWE7Ozs7O0FBTWQsR0FBRyxFQUFFLENBQUM7OztBQUdOLElBQUksRUFBRSxHQUFHLEdBQUcs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QzdELFFBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtBQUNqQixhQUFRLEdBQUcsRUFBRSxDQUFDOztLQUVkOztBQUVELFFBQUkscUJBQXFCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsRUFBRSxFQUN2RSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixRQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQ3hFLHFCQUFxQixFQUFFLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBQzFEOzs7O0FBRUQsd0JBQXNCO1VBQUEsZ0NBQUMsRUFBRSxFQUFFO0FBQzFCLFFBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM1RCxRQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQzVCLFFBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFDbkIsU0FBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7S0FDZjs7QUFBQSxJQUVEOzs7Ozs7UUE1RG1CLE9BQU87OztpQkFBUCxPQUFPIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7XG5cdGNyZWF0ZVJpbmdSb2FkXG59XG5mcm9tICcuL3JvYWROZXR3b3JrRmFjdG9yeSc7XG5pbXBvcnQgUm9hZE5ldHdvcmsgZnJvbSAnLi9yb2FkTmV0d29yayc7XG5pbXBvcnQgUm9hZFNlZ21lbnQgZnJvbSAnLi9yb2FkU2VnbWVudCc7XG5pbXBvcnQgcmFmIGZyb20gJy4vcmFmJztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuL3JlbmRlcmVyJztcbmltcG9ydCB7XG5cdGxvYWRSZXNvdXJjZXNcbn1cbmZyb20gJy4vcmVzb3VyY2VzJztcblxuXG4vLyBwb2x5ZmlsbCByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbnJhZigpO1xuXG4vLyBkdCBpcyBkeW5hbWljYWxseSBjaGFuZ2VkLiBTZWUgbWFpbkxvb3AuXG5sZXQgZHQgPSAwLjI7XG5sZXQgc2ltdWxhdGlvblRpbWUgPSAwO1xubGV0IGl0ZXJhdGlvbkNvdW50ID0gMDtcblxubGV0IHJ1bm5pbmcgPSBmYWxzZTtcbmxldCB0aW1lO1xubGV0IHRpbWVXYXJwID0gNDtcblxubGV0IHJlbmRlcmVyO1xubGV0IHJvYWROZXR3b3JrO1xuXG5sb2FkUmVzb3VyY2VzKGZ1bmN0aW9uKCkge1xuXHRsZXQgcm9hZExlbmd0aCA9IDEwMDA7XG5cdGxldCBudW1iZXJPZkxhbmVzID0gMTtcblx0cm9hZE5ldHdvcmsgPSBjcmVhdGVSaW5nUm9hZChyb2FkTGVuZ3RoLCBudW1iZXJPZkxhbmVzKTtcblxuXHRyZW5kZXJlciA9IG5ldyBSZW5kZXJlcihyb2FkTmV0d29yayk7XG5cdHJlbmRlcmVyLmRyYXdSb2FkcygpO1xuXHRyZW5kZXJlci5kcmF3QmFja2dyb3VuZCgpO1xuXG5cdHN0YXJ0KCk7XG59KTtcblxuZnVuY3Rpb24gc3RhcnQoKSB7XG5cdHJ1bm5pbmcgPSB0cnVlO1xuXHR0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdG1haW5Mb29wKCk7XG59XG5cbmZ1bmN0aW9uIHN0b3AoKSB7XG5cdHJ1bm5pbmcgPSBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIHJlc2V0KCkge1xuXHRkdCA9IDAuMjtcblx0c2ltdWxhdGlvblRpbWUgPSAwO1xuXHRpdGVyYXRpb25Db3VudCA9IDA7XG59O1xuXG5mdW5jdGlvbiBtYWluTG9vcCgpIHtcblx0aWYgKHJ1bm5pbmcpIHtcblxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShtYWluTG9vcCk7XG5cblx0XHR2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0ZHQgPSAobm93IC0gKHRpbWUgfHwgbm93KSkgLyAxMDAwO1xuXHRcdGR0ICo9IHRpbWVXYXJwO1xuXHRcdHRpbWUgPSBub3c7XG5cblx0XHQvLyB1cGRhdGUgc3RhdGVcblx0XHRzaW11bGF0aW9uVGltZSArPSBkdDtcblx0XHRpdGVyYXRpb25Db3VudCsrO1xuXHRcdHJvYWROZXR3b3JrLnRpbWVTdGVwKGR0KTtcblxuXHRcdC8vIGRyYXdcblx0XHRyZW5kZXJlci5jbGVhcigpO1xuXHRcdHJlbmRlcmVyLmRyYXdCYWNrZ3JvdW5kKCk7XG5cdFx0cmVuZGVyZXIuZHJhd1JvYWRzKCk7XG5cdFx0cmVuZGVyZXIuZHJhd1ZlaGljbGVzKHJvYWROZXR3b3JrKTtcblxuXHRcdC8vIGxpbWl0IGl0ZXJhdGlvbnMgZm9yIG5vd1xuXHRcdGlmIChpdGVyYXRpb25Db3VudCA+PSAxMDAwKSB7XG5cdFx0XHRydW5uaW5nID0gZmFsc2U7XG5cblx0XHRcdHJvYWROZXR3b3JrLnJvYWRTZWdtZW50c1swXS5yb2FkTGFuZXNbMF0udmVoaWNsZXMuZm9yRWFjaChmdW5jdGlvbih2ZWhpY2xlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCd2ZWhpY2xlOiAnLCB2ZWhpY2xlLmlkLCAnICBwb3M6ICcsIHZlaGljbGUucG9zaXRpb24udG9GaXhlZChcblx0XHRcdFx0XHQyKSwgJyAgc3BlZWQ6ICcsIHZlaGljbGUuc3BlZWQudG9GaXhlZCgyKSwgJyAgYWNjOiAnLCB2ZWhpY2xlLmFjYy50b0ZpeGVkKFxuXHRcdFx0XHRcdDQpLCAnICAgYTogJywgdmVoaWNsZS5jYXJGb2xsb3dpbmdNb2RlbFBhcmFtZXRlcnMuYSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoaXRlcmF0aW9uQ291bnQgJSAxMDAgPT09IDApIHtcblx0XHRcdGNvbnNvbGUubG9nKCd0aW1lU3RlcDogJywgZHQsICcgLS0gc2ltVGltZTogJywgc2ltdWxhdGlvblRpbWUsXG5cdFx0XHRcdCcgLS0gaXRlcmF0aW9uY291bnQ6ICcsIGl0ZXJhdGlvbkNvdW50KTtcblxuXHRcdFx0cm9hZE5ldHdvcmsucm9hZFNlZ21lbnRzWzBdLnJvYWRMYW5lc1swXS52ZWhpY2xlcy5mb3JFYWNoKGZ1bmN0aW9uKHZlaGljbGUpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ3ZlaGljbGU6ICcsIHZlaGljbGUuaWQsICcgIHBvczogJywgdmVoaWNsZS5wb3NpdGlvbi50b0ZpeGVkKFxuXHRcdFx0XHRcdDIpLCAnICBzcGVlZDogJywgdmVoaWNsZS5zcGVlZC50b0ZpeGVkKDIpLCAnICBhY2M6ICcsIHZlaGljbGUuYWNjLnRvRml4ZWQoXG5cdFx0XHRcdFx0NCksICcgICBhOiAnLCB2ZWhpY2xlLmNhckZvbGxvd2luZ01vZGVsUGFyYW1ldGVycy5hKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXG5cdH0gZWxzZSB7XG5cdFx0Y29uc29sZS5sb2coJ3RpbWVTdGVwOiAnLCBkdCwgJyAtLSBzaW1UaW1lOiAnLCBzaW11bGF0aW9uVGltZSxcblx0XHRcdCcgLS0gaXRlcmF0aW9uY291bnQ6ICcsIGl0ZXJhdGlvbkNvdW50KTtcblx0fVxuXG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBJZG1QYXJhbWV0ZXJzIHtcblxuICBjb25zdHJ1Y3Rvcih2MCA9IDIwLCBhID0gMS4yLCBiID0gMS4yLCBUID0gMS41LCBzMCA9IDIsIHMxID0gMCwgZGVsdGEgPSA0KSB7XG4gICAgdGhpcy52MCA9IHYwO1xuICAgIHRoaXMuYSA9IGE7XG4gICAgdGhpcy5iID0gYjtcbiAgICB0aGlzLlQgPSBUO1xuICAgIHRoaXMuczAgPSBzMDtcbiAgICB0aGlzLnMxID0gczE7XG4gICAgdGhpcy5kZWx0YSA9IGRlbHRhO1xuICB9XG5cbiAgc3RhdGljIGdldERlZmF1bHRDYXIoKSB7XG4gICAgcmV0dXJuIG5ldyBJZG1QYXJhbWV0ZXJzKCk7XG4gIH07XG5cbiAgc3RhdGljIGdldERlZmF1bHRUcnVjaygpIHtcbiAgICBsZXQgZGVmYXVsdFRydWNrID0gbmV3IElkbVBhcmFtZXRlcnMoKTtcbiAgICBkZWZhdWx0VHJ1Y2sudjAgPSAwLjggKiBkZWZhdWx0VHJ1Y2sudjA7XG4gICAgZGVmYXVsdFRydWNrLmEgPSAwLjggKiBkZWZhdWx0VHJ1Y2suYTtcbiAgICBkZWZhdWx0VHJ1Y2suVCA9IDEuMiAqIGRlZmF1bHRUcnVjay5UO1xuICAgIHJldHVybiBkZWZhdWx0VHJ1Y2s7XG4gIH07XG5cbn1cbiIsImltcG9ydCBJZG1QYXJhbWV0ZXJzIGZyb20gJy4vaWRtJztcblxuXG5sZXQgbWF4RGVjZWxlcmF0aW9uID0gMjA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVscyB7XG5cblx0c3RhdGljIGlkbUNhbGNBY2MocywgdiwgdmwsIHYwZWZmLCBwYXJhbWV0ZXJzKSB7XG5cdFx0bGV0IGFjY0ZyZWUgPSBwYXJhbWV0ZXJzLmEgKiAoMSAtIE1hdGgucG93KHYgLyB2MGVmZiwgcGFyYW1ldGVycy5kZWx0YSkpO1xuXHRcdGxldCBzc3RhciA9IHBhcmFtZXRlcnMuczAgKyB2ICogcGFyYW1ldGVycy5UICsgcGFyYW1ldGVycy5zMSAqIE1hdGguc3FydCgodiArXG5cdFx0XHQwLjAwMDEpIC8gdjBlZmYpICsgMC41ICogdiAqICh2IC0gdmwpIC8gTWF0aC5zcXJ0KHBhcmFtZXRlcnMuYSAqXG5cdFx0XHRwYXJhbWV0ZXJzLmIpO1xuXHRcdGxldCBhY2NJbnQgPSAtcGFyYW1ldGVycy5hICogTWF0aC5wb3coc3N0YXIgLyBNYXRoLm1heChzLCBwYXJhbWV0ZXJzLnMwKSwgMik7XG5cdFx0cmV0dXJuIE1hdGgubWF4KC1tYXhEZWNlbGVyYXRpb24sIGFjY0ZyZWUgKyBhY2NJbnQpO1xuXHR9XG5cblx0c3RhdGljIGNhbGN1bGF0ZUFjY2VsZXJhdGlvbihzLCB2LCB2bCwgdjBlZmYsIHBhcmFtZXRlcnMpIHtcblx0XHQvLyBUT0RPIGNoZWNrIGVmZmVjdGl2ZSBzcGVlZCBvZiBpbnN0YW5jZW9mIGNhbGxcblx0XHRpZiAocGFyYW1ldGVycyBpbnN0YW5jZW9mIElkbVBhcmFtZXRlcnMpIHtcblx0XHRcdHJldHVybiBNb2RlbHMuaWRtQ2FsY0FjYyhzLCB2LCB2bCwgdjBlZmYsIHBhcmFtZXRlcnMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBFcnJvcihcImNhbm5vdCBtYXAgcGFyYW1ldGVycyB0byBhY2NlbGVyYXRpb24gZnVuY3Rpb25cIiArIHBhcmFtZXRlcnMudG9TdHJpbmcoKSk7XG5cdFx0fVxuXHR9O1xufVxuIiwiLy8gaHR0cDovL3BhdWxpcmlzaC5jb20vMjAxMS9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWFuaW1hdGluZy9cbi8vIGh0dHA6Ly9teS5vcGVyYS5jb20vZW1vbGxlci9ibG9nLzIwMTEvMTIvMjAvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1lci1hbmltYXRpbmdcblxuLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGJ5IEVyaWsgTcO2bGxlclxuLy8gZml4ZXMgZnJvbSBQYXVsIElyaXNoIGFuZCBUaW5vIFppamRlbFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYWYoKSB7XG5cdHZhciBsYXN0VGltZSA9IDA7XG5cdHZhciB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXTtcblx0Zm9yICh2YXIgeCA9IDA7IHggPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKyt4KSB7XG5cdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdICsgJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuXHRcdHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdICsgJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gfHxcblx0XHRcdHdpbmRvd1t2ZW5kb3JzW3hdICsgJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuXHR9XG5cblx0aWYgKCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKVxuXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuXHRcdFx0dmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0XHR2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcblx0XHRcdHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRpbWVUb0NhbGwpO1xuXHRcdFx0bGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG5cdFx0XHRyZXR1cm4gaWQ7XG5cdFx0fTtcblxuXHRpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcblx0XHR3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdFx0Y2xlYXJUaW1lb3V0KGlkKTtcblx0XHR9O1xuXG5cdGNvbnNvbGUubG9nKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgc2V0OiAnLCB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKTtcbn1cbiIsImltcG9ydCB7XG5cdGdldEltYWdlXG59XG5mcm9tICcuL3Jlc291cmNlcyc7XG5cblxuLy8gVE9ETyByZXBsYWNlIGZpeGVkIHNjYWxlIG51bWJlcnNcbnZhciBzY2FsZUZhY3RvckltZyA9IDE7XG52YXIgY2VudGVyX3ggPSAwLjUwICogODAwICogc2NhbGVGYWN0b3JJbWc7XG52YXIgY2VudGVyX3kgPSAwLjQ4ICogODAwICogc2NhbGVGYWN0b3JJbWc7XG52YXIgc2NhbGUgPSAxLjI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlcmVyIHtcblxuXHRjb25zdHJ1Y3RvcihuZXR3b3JrKSB7XG5cdFx0dGhpcy5yb2FkTmV0d29yayA9IG5ldHdvcms7XG5cdFx0dGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFuaW1hdGlvbi1jYW52YXNcIik7XG5cdFx0dGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cblx0XHRsZXQgd2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCA9IDgwMDsgLy9iYWNrZ3JvdW5kSW1hZ2Uud2lkdGg7XG5cdFx0bGV0IGhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IDgwMDsgLy8gYmFja2dyb3VuZEltYWdlLmhlaWdodDtcblxuXHRcdHRoaXMuY2FyID0gZ2V0SW1hZ2UoJ2NhcjEnKTtcblx0XHR0aGlzLnRydWNrID0gZ2V0SW1hZ2UoJ3RydWNrMScpO1xuXHRcdGRlYnVnZ2VyO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuXHR9O1xuXG5cdGRyYXdCYWNrZ3JvdW5kKCkge1xuXHRcdHRoaXMuY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcblx0XHR0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiMxMTMzNjZcIjtcblxuXHRcdHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuXHR9XG5cblx0ZHJhd1JvYWRzKCkge1xuXG5cdH1cblxuXHRkcmF3VmVoaWNsZXMocm9hZE5ldHdvcmspIHtcblx0XHQvLyBsZXQgcm9hZFNlZ21lbnRzID0gcm9hZE5ldHdvcmsucm9hZFNlZ21lbnRzWzBdO1xuXHRcdGRlYnVnZ2VyO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcm9hZE5ldHdvcmsucm9hZFNlZ21lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgcm9hZFNlZ21lbnQgPSByb2FkTmV0d29yay5yb2FkU2VnbWVudHNbaV07XG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHJvYWRTZWdtZW50LnJvYWRMYW5lcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRsZXQgcm9hZExhbmUgPSByb2FkU2VnbWVudC5yb2FkTGFuZXNbal07XG5cdFx0XHRcdGZvciAobGV0IGsgPSAwOyBrIDwgcm9hZExhbmUudmVoaWNsZXMubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0XHRsZXQgdmVoaWNsZSA9IHJvYWRMYW5lLnZlaGljbGVzW2tdO1xuXHRcdFx0XHRcdC8vIGNyZWF0ZSBncmFwaGljYWwgb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlIHZlaGljbGUgb2NjdXBhdGlvblxuXHRcdFx0XHRcdC8vICAgICAgICAgICAgICAgICAgICAgICAgdmVoUGl4W2luZGV4XT1uZXcgdmVoUGl4X2NzdHIodmVoaWNsZSk7XG5cdFx0XHRcdFx0Ly9cblx0XHRcdFx0XHQvLy8vICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGk9MDsgaTxuOyBpKyspe1xuXHRcdFx0XHRcdC8vICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZlaF9sZW49dmVoaWNsZS5sZW5ndGg7XG5cdFx0XHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmVoX3c9IHZlaGljbGUud2lkdGg7XG5cdFx0XHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeD12ZWhQaXhbaW5kZXhdLng7XG5cdFx0XHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeT12ZWhQaXhbaW5kZXhdLnk7XG5cdFx0XHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2lucGhpPXZlaFBpeFtpbmRleF0uc3BoaTtcblx0XHRcdFx0XHQvLyAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3NwaGk9dmVoUGl4W2luZGV4XS5jcGhpO1xuXHRcdFx0XHRcdC8vXG5cdFx0XHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICBjdHguc2V0VHJhbnNmb3JtKGNvc3BoaSwgc2lucGhpLCAtc2lucGhpLCBjb3NwaGksIHgsIHkpO1xuXHRcdFx0XHRcdC8vICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZlaEltYWdlID0gdmVoaWNsZS5pc1RydWNrID8gdHJ1Y2sgOiBjYXI7XG5cdFx0XHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKHZlaEltYWdlLCAtMC41KnZlaF9sZW4sIC0wLjUqIHZlaF93LCB2ZWhfbGVuLCB2ZWhfdyk7XG5cdFx0XHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgIH1cblxuXHRcdFx0XHRcdC8vIFRPRE8gY2FsY3VsYXRlIGNvcnJlY3Qgc2NyZWVuIGNvb3JkaW5hdGVzIGZyb20gcm9hZFNlZ21lbnQgZ2VvbWV0cnlcblx0XHRcdFx0XHR2YXIgeCA9IHZlaGljbGUucG9zaXRpb247IC8vIHJpbmdyb2FkICEhXG5cdFx0XHRcdFx0dmFyIHkgPSByb2FkU2VnbWVudC5wYXJhbWV0ZXJzLmdsb2JhbFk7XG5cdFx0XHRcdFx0dmFyIHZlaEltYWdlID0gdmVoaWNsZS5pc1RydWNrID8gdGhpcy50cnVjayA6IHRoaXMuY2FyO1xuXHRcdFx0XHRcdHRoaXMuY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcblx0XHRcdFx0XHR2YXIgc2NhbGVJbWcgPSBzY2FsZSAqIHNjYWxlRmFjdG9ySW1nO1xuXHRcdFx0XHRcdHRoaXMuY3R4LmRyYXdJbWFnZSh2ZWhJbWFnZSwgeCwgeSwgc2NhbGVJbWcgKiAzMCwgc2NhbGVJbWcgKiAyMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gcm9hZE5ldHdvcmsucm9hZFNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24ocm9hZFNlY3Rpb24pIHtcblx0XHQvLyBcdHJvYWRTZWN0aW9uLnJvYWRMYW5lcy5mb3JFYWNoKGZ1bmN0aW9uKHJvYWRMYW5lKSB7XG5cdFx0Ly8gXHRcdHJvYWRMYW5lLnZlaGljbGVzLmZvckVhY2goZnVuY3Rpb24odmVoaWNsZSwgaW5kZXgpIHtcblx0XHQvL1xuXHRcdC8vIFx0XHRcdC8vIGNyZWF0ZSBncmFwaGljYWwgb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlIHZlaGljbGUgb2NjdXBhdGlvblxuXHRcdC8vIFx0XHRcdC8vICAgICAgICAgICAgICAgICAgICAgICAgdmVoUGl4W2luZGV4XT1uZXcgdmVoUGl4X2NzdHIodmVoaWNsZSk7XG5cdFx0Ly8gXHRcdFx0Ly9cblx0XHQvLyBcdFx0XHQvLy8vICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGk9MDsgaTxuOyBpKyspe1xuXHRcdC8vIFx0XHRcdC8vICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZlaF9sZW49dmVoaWNsZS5sZW5ndGg7XG5cdFx0Ly8gXHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmVoX3c9IHZlaGljbGUud2lkdGg7XG5cdFx0Ly8gXHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeD12ZWhQaXhbaW5kZXhdLng7XG5cdFx0Ly8gXHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeT12ZWhQaXhbaW5kZXhdLnk7XG5cdFx0Ly8gXHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2lucGhpPXZlaFBpeFtpbmRleF0uc3BoaTtcblx0XHQvLyBcdFx0XHQvLyAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3NwaGk9dmVoUGl4W2luZGV4XS5jcGhpO1xuXHRcdC8vIFx0XHRcdC8vXG5cdFx0Ly8gXHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICBjdHguc2V0VHJhbnNmb3JtKGNvc3BoaSwgc2lucGhpLCAtc2lucGhpLCBjb3NwaGksIHgsIHkpO1xuXHRcdC8vIFx0XHRcdC8vICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZlaEltYWdlID0gdmVoaWNsZS5pc1RydWNrID8gdHJ1Y2sgOiBjYXI7XG5cdFx0Ly8gXHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKHZlaEltYWdlLCAtMC41KnZlaF9sZW4sIC0wLjUqIHZlaF93LCB2ZWhfbGVuLCB2ZWhfdyk7XG5cdFx0Ly8gXHRcdFx0Ly8gICAgICAgICAgICAgICAgICAgIH1cblx0XHQvL1xuXHRcdC8vIFx0XHRcdC8vIFRPRE8gY2FsY3VsYXRlIGNvcnJlY3Qgc2NyZWVuIGNvb3JkaW5hdGVzIGZyb20gcm9hZFNlZ21lbnQgZ2VvbWV0cnlcblx0XHQvLyBcdFx0XHR2YXIgeCA9IHZlaGljbGUucG9zaXRpb247IC8vIHJpbmdyb2FkICEhXG5cdFx0Ly8gXHRcdFx0dmFyIHkgPSByb2FkU2VjdGlvbi5wYXJhbWV0ZXJzLmdsb2JhbFk7XG5cdFx0Ly8gXHRcdFx0dmFyIHZlaEltYWdlID0gdmVoaWNsZS5pc1RydWNrID8gdGhpcy50cnVjayA6IHRoaXMuY2FyO1xuXHRcdC8vIFx0XHRcdHRoaXMuY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcblx0XHQvLyBcdFx0XHR2YXIgc2NhbGVJbWcgPSBzY2FsZSAqIHNjYWxlRmFjdG9ySW1nO1xuXHRcdC8vIFx0XHRcdHRoaXMuY3R4LmRyYXdJbWFnZSh2ZWhJbWFnZSwgeCwgeSwgc2NhbGVJbWcgKiAzMCwgc2NhbGVJbWcgKiAyMCk7XG5cdFx0Ly8gXHRcdH0pO1xuXHRcdC8vIFx0fSk7XG5cdFx0Ly8gfSk7XG5cblx0fVxuXG59XG4iLCJ2YXIgaW1hZ2VzID0ge307XG52YXIgc291cmNlcyA9IHtcblx0Y2FyMTogJy4uL2ltZy9jYXJTbWFsbDIucG5nJyxcblx0dHJ1Y2sxOiAnLi4vaW1nL3RydWNrMVNtYWxsLnBuZycsXG5cdHJpbmdSb2FkT25lTGFuZTogJy4uL2ltZy9vbmVMYW5lc1JvYWRSZWFsaXN0aWNfd2lkZUJvdW5kYXJpZXNfY3JvcHBlZDIucG5nJ1xufTtcblxuLyoqXG4gKiBMb2FkcyBhbGwgaW1hZ2VzIGRlY2xhcmVkIGluIHNvdXJjZXMgdmFyaWFibGUgYW5kIHN0b3JlcyB0aGVtIGluIGltYWdlcyB2YXJpYWJsZS5cbiAqIEFmdGVyIGFsbCBpbWFnZXMgYXJlIGxvYWRlZCB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBDYWxsZWQgd2hlbiBhbGwgaW1hZ2VzIGFyZSBsb2FkZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkUmVzb3VyY2VzKGNhbGxiYWNrKSB7XG5cdHZhciBsb2FkZWRJbWFnZXMgPSAwO1xuXHR2YXIgbnVtSW1hZ2VzVG9Mb2FkID0gT2JqZWN0LmtleXMoc291cmNlcykubGVuZ3RoO1xuXHRmb3IgKHZhciBzcmMgaW4gc291cmNlcykge1xuXHRcdGltYWdlc1tzcmNdID0gbmV3IEltYWdlKCk7XG5cdFx0aW1hZ2VzW3NyY10ub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2FkZWRJbWFnZXMrKztcblx0XHRcdGlmIChsb2FkZWRJbWFnZXMgPj0gbnVtSW1hZ2VzVG9Mb2FkKSB7XG5cdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpbWFnZXNbc3JjXS5zcmMgPSBzb3VyY2VzW3NyY107XG5cdH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbWFnZShpbWdOYW1lKSB7XG5cdGlmIChpbWFnZXNbaW1nTmFtZV0pIHtcblx0XHRyZXR1cm4gaW1hZ2VzW2ltZ05hbWVdO1xuXHR9XG5cdGRlYnVnZ2VyO1xuXHR0aHJvdyBuZXcgRXJyb3IoaW1nTmFtZSArICcgaW1hZ2Ugbm90IGRlZmluZWQgaW4gbW92c2ltLnJlc3NvdXJjZXMnKTtcbn07XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBSb2FkTGFuZSB7XG5cbiAgY29uc3RydWN0b3Iocm9hZFNlZ21lbnQpIHtcbiAgICB0aGlzLnZlaGljbGVzID0gW107XG4gICAgdGhpcy5yb2FkU2VnbWVudCA9IHJvYWRTZWdtZW50O1xuICAgIHRoaXMuc2lua0xhbmVTZWdtZW50ID0gbnVsbDsgLy9UT0RPXG4gICAgdGhpcy5zb3VyY2VMYW5lU2VnbWVudCA9IG51bGw7IC8vVE9ET1xuICB9XG5cbiAgZ2V0Um9hZExlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5yb2FkU2VnbWVudC5yb2FkTGVuZ3RoO1xuICB9O1xuXG4gIGFkZFZlaGljbGUodmVoaWNsZSkge1xuICAgIHRoaXMudmVoaWNsZXMucHVzaCh2ZWhpY2xlKTtcbiAgfTtcblxuICB1cGRhdGVWZWhpY2xlQWNjZWxlcmF0aW9ucygpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy52ZWhpY2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmFyIHZlaGljbGUgPSB0aGlzLnZlaGljbGVzW2ldO1xuICAgICAgdmVoaWNsZS51cGRhdGVBY2NlbGVyYXRpb24odGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIHVwZGF0ZVNwZWVkQW5kUG9zaXRpb24oZHQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmVoaWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2ZWhpY2xlID0gdGhpcy52ZWhpY2xlc1tpXTtcbiAgICAgIHZlaGljbGUudXBkYXRlU3BlZWRBbmRQb3NpdGlvbihkdCk7XG4gICAgICBpZiAodGhpcy5yb2FkU2VnbWVudC5wYXJhbWV0ZXJzLnJpbmdSb2FkICYmIHZlaGljbGUucG9zaXRpb24gPiB0aGlzLnJvYWRTZWdtZW50XG4gICAgICAgIC5wYXJhbWV0ZXJzLnJvYWRMZW5ndGgpIHtcbiAgICAgICAgdmVoaWNsZS5wb3NpdGlvbiAtPSB0aGlzLnJvYWRTZWdtZW50LnBhcmFtZXRlcnMucm9hZExlbmd0aDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZ2V0TGFuZVJlYXJWZWhpY2xlKCkge1xuICAgIGlmICh0aGlzLnZlaGljbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0aGlzLnZlaGljbGVzW3RoaXMudmVoaWNsZXMubGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIGdldExhbmVGcm9udFZlaGljbGUoKSB7XG4gICAgaWYgKHRoaXMudmVoaWNsZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHRoaXMudmVoaWNsZXNbMF07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIGdldFJlYXJWZWhpY2xlKHBvc2l0aW9uKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fcG9zaXRpb25CaW5hcnlTZWFyY2gocG9zaXRpb24pO1xuICAgIHZhciBpbnNlcnRpb25Qb2ludCA9IC1pbmRleCAtIDE7XG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIC8vIGV4YWN0IG1hdGNoIGZvdW5kLCBzbyByZXR1cm4gdGhlIG1hdGNoZWQgdmVoaWNsZVxuICAgICAgaWYgKGluZGV4IDwgdGhpcy52ZWhpY2xlcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmVoaWNsZXNbaW5kZXhdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBnZXQgbmV4dCB2ZWhpY2xlIGlmIG5vdCBwYXN0IGVuZFxuICAgICAgaWYgKGluc2VydGlvblBvaW50IDwgdGhpcy52ZWhpY2xlcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmVoaWNsZXNbaW5zZXJ0aW9uUG9pbnRdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5zb3VyY2VMYW5lU2VnbWVudCAhPT0gbnVsbCkge1xuICAgICAgLy8gZGlkbid0IGZpbmQgYSByZWFyIHZlaGljbGUgaW4gdGhlIGN1cnJlbnQgcm9hZCBzZWdtZW50LCBzb1xuICAgICAgLy8gY2hlY2sgdGhlIHByZXZpb3VzIChzb3VyY2UpIHJvYWQgc2VnbWVudFxuICAgICAgLy8gYW5kIGNvbnRpbnVlIHVudGlsIGEgdmVoaWNsZSBpcyBmb3VuZCBvciBubyBmdXJ0aGVyIHNvdXJjZSBpcyBjb25uZWN0ZWQgdG8gbGFuZVNlZ21lbnRcbiAgICAgIHZhciBzb3VyY2VGcm9udFZlaGljbGUgPSBudWxsO1xuICAgICAgdmFyIHNvdXJjZSA9IHRoaXMuc291cmNlTGFuZVNlZ21lbnQ7XG4gICAgICB2YXIgYWNjdW1EaXN0YW5jZSA9IDA7XG4gICAgICBkbyB7XG4gICAgICAgIGFjY3VtRGlzdGFuY2UgKz0gc291cmNlLmdldFJvYWRMZW5ndGgoKTtcbiAgICAgICAgc291cmNlRnJvbnRWZWhpY2xlID0gc291cmNlLmxhbmVGcm9udFZlaGljbGUoKTtcbiAgICAgICAgc291cmNlID0gc291cmNlLnNvdXJjZUxhbmVTZWdtZW50KCk7XG4gICAgICB9IHdoaWxlIChzb3VyY2VGcm9udFZlaGljbGUgPT09IG51bGwgJiYgc291cmNlICE9PSBudWxsKTtcbiAgICAgIGlmIChzb3VyY2VGcm9udFZlaGljbGUgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gc291cmNlRnJvbnRWZWhpY2xlLmdldEZyb250UG9zaXRpb24oKSAtXG4gICAgICAgICAgYWNjdW1EaXN0YW5jZTtcbiAgICAgICAgcmV0dXJuIG1vdnNpbS5zaW11bGF0aW9uLm1vdmVhYmxlLmNyZWF0ZShzb3VyY2VGcm9udFZlaGljbGUsXG4gICAgICAgICAgbmV3UG9zaXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBnZXRGcm9udFZlaGljbGUocG9zaXRpb24pIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9wb3NpdGlvbkJpbmFyeVNlYXJjaChwb3NpdGlvbik7XG4gICAgdmFyIGluc2VydGlvblBvaW50ID0gLWluZGV4IC0gMTtcbiAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy52ZWhpY2xlc1tpbmRleCAtIDFdOyAvLyBleGFjdCBtYXRjaCBmb3VuZFxuICAgIH0gZWxzZSBpZiAoaW5zZXJ0aW9uUG9pbnQgPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy52ZWhpY2xlc1tpbnNlcnRpb25Qb2ludCAtIDFdO1xuICAgIH1cbiAgICAvLyBpbmRleCA9PSAwIG9yIGluc2VydGlvblBvaW50ID09IDBcbiAgICAvLyBzdWJqZWN0IHZlaGljbGUgaXMgZnJvbnQgdmVoaWNsZSBvbiB0aGlzIHJvYWQgc2VnbWVudCwgc28gY2hlY2sgZm9yIHZlaGljbGVzXG4gICAgLy8gb24gc2luayBsYW5lIHNlZ21lbnRcbiAgICBpZiAodGhpcy5zaW5rTGFuZVNlZ21lbnQgIT09IG51bGwpIHtcbiAgICAgIHZhciBzaW5rUmVhclZlaGljbGUgPSBudWxsO1xuICAgICAgdmFyIHNpbmsgPSB0aGlzLnNpbmtMYW5lU2VnbWVudDtcbiAgICAgIHZhciBhY2N1bURpc3RhbmNlID0gdGhpcy5nZXRSb2FkTGVuZ3RoKCk7XG4gICAgICBkbyB7XG4gICAgICAgIHNpbmtSZWFyVmVoaWNsZSA9IHNpbmsucmVhclZlaGljbGUoKTtcbiAgICAgICAgaWYgKHNpbmtSZWFyVmVoaWNsZSA9PT0gbnVsbCkge1xuICAgICAgICAgIGFjY3VtRGlzdGFuY2UgKz0gc2luay5nZXRSb2FkTGVuZ3RoKCk7XG4gICAgICAgIH1cbiAgICAgICAgc2luayA9IHNpbmsuc2lua0xhbmVTZWdtZW50KCk7XG4gICAgICB9IHdoaWxlIChzaW5rUmVhclZlaGljbGUgPT09IG51bGwgJiYgc2luayAhPT0gbnVsbCk7XG4gICAgICBpZiAoc2lua1JlYXJWZWhpY2xlICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHNpbmtSZWFyVmVoaWNsZS5nZXRGcm9udFBvc2l0aW9uKCkgKyBhY2N1bURpc3RhbmNlO1xuICAgICAgICByZXR1cm4gbW92c2ltLnNpbXVsYXRpb24ubW92ZWFibGUuY3JlYXRlKHNpbmtSZWFyVmVoaWNsZSwgbmV3UG9zaXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICB1cGRhdGVPdXRmbG93KGR0KSB7XG4gICAgLy8gcmVtb3ZlIHZlaGljbGVzIHdpdGggcG9zaXRpb24gPiB0aGlzLnJvYWRTZWdtZW50LnJvYWRMZW5ndGggKGxhdGVyOiBhc3NpZ24gdG8gbGlua2VkIGxhbmUpXG4gICAgLy8gZm9yIHJpbmdyb2FkIHNldCB2ZWhpY2xlIGF0IGJlZ2lubmluZyBvZiBsYW5lIChwZXJpb2RpYyBib3VuZGFyeSBjb25kaXRpb25zKVxuICAgIHZhciByb2FkTGVuZ3RoID0gdGhpcy5yb2FkU2VnbWVudC5yb2FkTGVuZ3RoO1xuICAgIHZhciB2ZWhpY2xlO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLnZlaGljbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2ZWhpY2xlID0gdGhpcy52ZWhpY2xlc1tpXTtcbiAgICAgIGlmICh2ZWhpY2xlLnBvc2l0aW9uID4gcm9hZExlbmd0aCkge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICB0aGlzLnZlaGljbGVzLnJlbW92ZShpKTtcbiAgICAgICAgLy8gcmluZyByb2FkIHNwZWNpYWwgY2FzZSBUT0RPIHJlbW92ZVxuICAgICAgICB2ZWhpY2xlLnBvc2l0aW9uIC09IHJvYWRMZW5ndGg7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3NvcnRWZWhpY2xlcygpO1xuICB9O1xuXG4gIHVwZGF0ZUluZmxvdyhkdCkge1xuICAgIC8vIFRPRE9cbiAgfTtcblxuICBfc29ydFZlaGljbGVzKCkge1xuICAgIHRoaXMudmVoaWNsZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYS5wb3NpdGlvbiAtIGIucG9zaXRpb247XG4gICAgfSk7XG4gIH07XG5cbiAgZ2V0TGVhZGVyKHZlaGljbGUpIHtcbiAgICB2YXIgdmVoaWNsZUluZGV4ID0gdGhpcy5fZ2V0UG9zaXRpb25JbkFycmF5KHZlaGljbGUuaWQpO1xuICAgIGlmICh0aGlzLnZlaGljbGVzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHZlaGljbGVJbmRleCA9PT0gdGhpcy52ZWhpY2xlcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb2FkU2VnbWVudC5yaW5nUm9hZCA9PT0gdHJ1ZSA/IHRoaXMudmVoaWNsZXNbMF0gOiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy52ZWhpY2xlc1t2ZWhpY2xlSW5kZXggKyAxXTtcbiAgfTtcblxuICBfZ2V0UG9zaXRpb25JbkFycmF5KGlkKSB7XG4gICAgLy8gVE9ETyBlczYgLT4gZmluZEluZGV4XG4gICAgdmFyIGluZGV4ID0gdGhpcy52ZWhpY2xlcy5tYXAoZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiBlbC5pZDtcbiAgICB9KS5pbmRleE9mKGlkKTtcbiAgICByZXR1cm4gaW5kZXg7XG4gIH07XG5cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvYWROZXR3b3JrIHtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLnJvYWRTZWdtZW50cyA9IFtdO1xuXHRcdGNvbnNvbGUubG9nKCdjb250cnVjdG9yIFJvYWROZXR3b3JrJylcblx0fVxuXG5cdGFkZFJvYWRTZWdtZW50KHJvYWRTZWdtZW50KSB7XG5cdFx0dGhpcy5yb2FkU2VnbWVudHMucHVzaChyb2FkU2VnbWVudCk7XG5cdFx0Y29uc29sZS5sb2coJyAgYWRkZWQgJywgcm9hZFNlZ21lbnQsICcgdG8gcm9hZE5ldHdvcmsnLCB0aGlzLnJvYWRTZWdtZW50cyk7XG5cdH1cblxuXHR0aW1lU3RlcChkdCkge1xuXHRcdHRoaXMucm9hZFNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24ocm9hZFNlZ21ldCkge1xuXHRcdFx0cm9hZFNlZ21ldC5jb25zaWRlckxhbmVDaGFuZ2VzKGR0KTtcblx0XHR9KTtcblxuXHRcdHRoaXMucm9hZFNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24ocm9hZFNlZ21ldCkge1xuXHRcdFx0cm9hZFNlZ21ldC51cGRhdGVWZWhpY2xlQWNjZWxlcmF0aW9ucyhkdCk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnJvYWRTZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHJvYWRTZWdtZXQpIHtcblx0XHRcdHJvYWRTZWdtZXQudXBkYXRlVmVoaWNsZVBvc2l0aW9uc0FuZFNwZWVkcyhkdCk7XG5cdFx0fSk7XG5cblx0XHQvLyBmb3IgZGVidWdnaW5nXG5cdFx0dGhpcy5yb2FkU2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbihyb2FkU2VnbWV0KSB7XG5cdFx0XHRyb2FkU2VnbWV0LmNoZWNrRm9ySW5jb25zaXN0ZW5jaWVzKGR0KTtcblx0XHR9KTtcblxuXHRcdHRoaXMucm9hZFNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24ocm9hZFNlZ21ldCkge1xuXHRcdFx0cm9hZFNlZ21ldC51cGRhdGVPdXRmbG93KGR0KTtcblx0XHR9KTtcblxuXHRcdHRoaXMucm9hZFNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24ocm9hZFNlZ21ldCkge1xuXHRcdFx0cm9hZFNlZ21ldC51cGRhdGVJbmZsb3coZHQpO1xuXHRcdH0pO1xuXHR9XG5cbn1cbiIsImltcG9ydCBSb2FkTmV0d29yayBmcm9tICcuL3JvYWROZXR3b3JrJztcbmltcG9ydCBSb2FkU2VnbWVudCBmcm9tICcuL3JvYWRTZWdtZW50JztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJpbmdSb2FkKHJvYWRMZW5ndGgsIG51bWJlck9mTGFuZXMpIHtcbiAgdmFyIHJvYWROZXR3b3JrID0gbmV3IFJvYWROZXR3b3JrKCk7XG5cbiAgLy8gY3JlYXRlIG9uZSByb2FkU2VjdGlvbiByZXByZXNlbnRpbmcgYSByaW5nIHJvYWQgKGFudGktY2xvY2t3aXNlIGRyaXZpbmcgZGlyZWN0aW9uKVxuICB2YXIgcm9hZFNlZ21lbnRQYXJhbWV0ZXJzID0gUm9hZFNlZ21lbnQuZ2V0RGVmYXVsdFBhcmFtZXRlcnMoKTtcbiAgcm9hZFNlZ21lbnRQYXJhbWV0ZXJzLnJpbmdSb2FkID0gdHJ1ZTtcbiAgcm9hZFNlZ21lbnRQYXJhbWV0ZXJzLnJvYWRMZW5ndGggPSByb2FkTGVuZ3RoO1xuICByb2FkU2VnbWVudFBhcmFtZXRlcnMubnVtYmVyT2ZMYW5lcyA9IG51bWJlck9mTGFuZXM7XG4gIHJvYWRTZWdtZW50UGFyYW1ldGVycy5nbG9iYWxYID0gMDtcbiAgcm9hZFNlZ21lbnRQYXJhbWV0ZXJzLmdsb2JhbFkgPSAyMDA7XG4gIHJvYWRTZWdtZW50UGFyYW1ldGVycy5oZWFkaW5nID0gMDtcbiAgcm9hZFNlZ21lbnRQYXJhbWV0ZXJzLmN1cnZhdHVyZSA9IDIgKiBNYXRoLlBJIC8gcm9hZExlbmd0aDtcblxuICB2YXIgcm9hZFNlZ21lbnQgPSBuZXcgUm9hZFNlZ21lbnQocm9hZFNlZ21lbnRQYXJhbWV0ZXJzKTtcblxuICByb2FkTmV0d29yay5hZGRSb2FkU2VnbWVudChyb2FkU2VnbWVudCk7XG4gIHJldHVybiByb2FkTmV0d29yaztcbn07XG4iLCJpbXBvcnQgUm9hZExhbmUgZnJvbSAnLi9yb2FkTGFuZSc7XG5pbXBvcnQgVmVoaWNsZSBmcm9tICcuL3ZlaGljbGUnO1xuaW1wb3J0IElkbVBhcmFtZXRlcnMgZnJvbSAnLi9pZG0nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb2FkU2VnbWVudCB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucykge1xuXHRcdHRoaXMucGFyYW1ldGVycyA9IG9wdGlvbnM7XG5cdFx0dGhpcy5yb2FkTGFuZXMgPSBbXTtcblx0XHR0aGlzLm51bWJlck9mTGFuZXMgPSBvcHRpb25zLm51bWJlck9mTGFuZXM7XG5cblx0XHRmb3IgKGxldCBpID0gMTsgaSA8PSB0aGlzLm51bWJlck9mTGFuZXM7IGkrKykge1xuXHRcdFx0bGV0IHJvYWRMYW5lID0gbmV3IFJvYWRMYW5lKHRoaXMpO1xuXHRcdFx0dGhpcy5yb2FkTGFuZXMucHVzaChyb2FkTGFuZSk7XG5cdFx0fVxuXG5cdFx0dmFyIHZlaGljbGVzSW5PbmVMYW5lID0gb3B0aW9ucy5yb2FkTGVuZ3RoICogb3B0aW9ucy5pbml0RGVuc2l0eVBlckxhbmU7XG5cdFx0dmFyIG51bWJlck9mVmVoaWNsZXMgPSBNYXRoLmZsb29yKHRoaXMubnVtYmVyT2ZMYW5lcyAqIHZlaGljbGVzSW5PbmVMYW5lKTtcblx0XHR0aGlzLl9pbml0aWFsaXplVmVoaWNsZXMobnVtYmVyT2ZWZWhpY2xlcywgb3B0aW9ucy5pbml0VHJ1Y2tGcmFjdGlvbik7XG5cblx0XHRjb25zb2xlLmxvZygnY29uc3RydWN0b3IgUm9hZFNlZ21lbnQnKTtcblx0fVxuXG5cdGNvbnNpZGVyTGFuZUNoYW5nZXMoZHQpIHt9XG5cblx0dXBkYXRlVmVoaWNsZUFjY2VsZXJhdGlvbnMoZHQpIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubnVtYmVyT2ZMYW5lczsgaSsrKSB7XG5cdFx0XHR0aGlzLnJvYWRMYW5lc1tpXS51cGRhdGVWZWhpY2xlQWNjZWxlcmF0aW9ucyhkdCk7XG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlVmVoaWNsZVBvc2l0aW9uc0FuZFNwZWVkcyhkdCkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5udW1iZXJPZkxhbmVzOyBpKyspIHtcblx0XHRcdHRoaXMucm9hZExhbmVzW2ldLnVwZGF0ZVNwZWVkQW5kUG9zaXRpb24oZHQpO1xuXHRcdH1cblx0fVxuXG5cdGNoZWNrRm9ySW5jb25zaXN0ZW5jaWVzKGR0KSB7XG5cdFx0Ly8gVE9ETyBpbXBsZW1lbnQgY2hlY2sgZm9yIG5lZ2F0aXZlIHZlaGljbGUgZGlzdGFuY2VzXG5cdH1cblxuXHR1cGRhdGVPdXRmbG93KGR0KSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mTGFuZXM7IGkrKykge1xuXHRcdFx0dGhpcy5yb2FkTGFuZXNbaV0udXBkYXRlT3V0ZmxvdyhkdCk7XG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlSW5mbG93KGR0KSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mTGFuZXM7IGkrKykge1xuXHRcdFx0dGhpcy5yb2FkTGFuZXNbaV0udXBkYXRlSW5mbG93KGR0KTtcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVmYXVsdFBhcmFtZXRlcnMoKSB7XG5cdFx0bGV0IHJvYWRTZWN0aW9uUGFyYW1ldGVycyA9IHt9O1xuXHRcdHJvYWRTZWN0aW9uUGFyYW1ldGVycy5yb2FkTGVuZ3RoID0gMTAwMDtcblx0XHRyb2FkU2VjdGlvblBhcmFtZXRlcnMubnVtYmVyT2ZMYW5lcyA9IDE7XG5cdFx0cm9hZFNlY3Rpb25QYXJhbWV0ZXJzLmluaXREZW5zaXR5UGVyTGFuZSA9IDEwIC8gMTAwMDtcblx0XHRyb2FkU2VjdGlvblBhcmFtZXRlcnMuaW5pdFRydWNrRnJhY3Rpb24gPSAwLjE7XG5cdFx0cm9hZFNlY3Rpb25QYXJhbWV0ZXJzLnJpbmdSb2FkID0gZmFsc2U7XG5cdFx0cm9hZFNlY3Rpb25QYXJhbWV0ZXJzLmdsb2JhbFggPSAwO1xuXHRcdHJvYWRTZWN0aW9uUGFyYW1ldGVycy5nbG9iYWxZID0gMDtcblx0XHRyb2FkU2VjdGlvblBhcmFtZXRlcnMuaGVhZGluZyA9IDA7XG5cdFx0cm9hZFNlY3Rpb25QYXJhbWV0ZXJzLmN1cnZhdHVyZSA9IDA7XG5cdFx0cm9hZFNlY3Rpb25QYXJhbWV0ZXJzLmxhbmVXaWR0aCA9IDEwO1xuXHRcdHJldHVybiByb2FkU2VjdGlvblBhcmFtZXRlcnM7XG5cdH1cblxuXHRfaW5pdGlhbGl6ZVZlaGljbGVzKG51bWJlck9mVmVoaWNsZXMsIHRydWNrRnJhY3Rpb24pIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG51bWJlck9mVmVoaWNsZXM7IGkrKykge1xuXHRcdFx0dmFyIHZlaGljbGVQYXJhbWV0ZXJzID0gVmVoaWNsZS5nZXREZWZhdWx0UGFyYW1ldGVycygpO1xuXHRcdFx0dmVoaWNsZVBhcmFtZXRlcnMuaXNUcnVjayA9IE1hdGgucmFuZG9tKCkgPCB0cnVja0ZyYWN0aW9uO1xuXHRcdFx0Ly8gaW5pdGlhbGl6ZSBhbGwgdmVoaWNsZXMgd2l0aCBzYW1lIHNwZWVkIGRldGVybWluZWQgYnkgc2xvd2VyIHRydWNrc1xuXHRcdFx0dmVoaWNsZVBhcmFtZXRlcnMuc3BlZWQgPSAwLjggKiBJZG1QYXJhbWV0ZXJzLmdldERlZmF1bHRUcnVjaygpXG5cdFx0XHRcdC52MDtcblx0XHRcdHZlaGljbGVQYXJhbWV0ZXJzLnBvc2l0aW9uID0gaSAqIDEwMDsgLy8gVE9ETyBpbml0IGNvcnJlY3RseVxuXHRcdFx0dmFyIHZlaGljbGUgPSBuZXcgVmVoaWNsZSh2ZWhpY2xlUGFyYW1ldGVycyk7XG5cdFx0XHR2YXIgbGFuZSA9IGkgJSB0aGlzLnJvYWRMYW5lcy5sZW5ndGg7XG5cdFx0XHR0aGlzLnJvYWRMYW5lc1tsYW5lXS5hZGRWZWhpY2xlKHZlaGljbGUpO1xuXHRcdH1cblx0fTtcbn1cbiIsImltcG9ydCBJZG1QYXJhbWV0ZXJzIGZyb20gJy4vaWRtJztcbmltcG9ydCBNb2RlbHMgZnJvbSAnLi9tb2RlbHMnO1xuXG52YXIgbnVtYmVyT2ZDcmVhdGVkVmVoaWNsZXMgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZWhpY2xlIHtcblxuXHRjb25zdHJ1Y3Rvcih2ZWhpY2xlUGFyYW1ldGVycykge1xuXHRcdHRoaXMudmVoaWNsZVBhcmFtZXRlcnMgPSB2ZWhpY2xlUGFyYW1ldGVycyB8fCBnZXREZWZhdWx0UGFyYW1ldGVycygpO1xuXG5cdFx0Ly8gcHVibGljIHZhcmlhYmxlc1xuXHRcdHRoaXMuaWQgPSArK251bWJlck9mQ3JlYXRlZFZlaGljbGVzO1xuXHRcdHRoaXMuaXNUcnVjayA9IHZlaGljbGVQYXJhbWV0ZXJzLmlzVHJ1Y2s7XG5cdFx0dGhpcy5sZW5ndGggPSB2ZWhpY2xlUGFyYW1ldGVycy5sZW5ndGg7XG5cdFx0dGhpcy53aWR0aCA9IHZlaGljbGVQYXJhbWV0ZXJzLndpZHRoO1xuXHRcdHRoaXMucG9zaXRpb24gPSB2ZWhpY2xlUGFyYW1ldGVycy5wb3NpdGlvbjtcblx0XHR0aGlzLnNwZWVkID0gdmVoaWNsZVBhcmFtZXRlcnMuc3BlZWQ7XG5cdFx0dGhpcy5hY2MgPSB2ZWhpY2xlUGFyYW1ldGVycy5hY2M7XG5cdFx0dGhpcy5jYXJGb2xsb3dpbmdNb2RlbFBhcmFtZXRlcnMgPSB2ZWhpY2xlUGFyYW1ldGVycy5pc1RydWNrID8gSWRtUGFyYW1ldGVyc1xuXHRcdFx0LmdldERlZmF1bHRUcnVjaygpIDogSWRtUGFyYW1ldGVycy5nZXREZWZhdWx0Q2FyKCk7XG5cdFx0dGhpcy52TGltaXQgPSB0aGlzLmNhckZvbGxvd2luZ01vZGVsUGFyYW1ldGVycy52MDsgLy8gaWYgZWZmZWN0aXZlIHNwZWVkIGxpbWl0cywgdkxpbWl0PHYwXG5cdFx0dGhpcy52TWF4ID0gdGhpcy5jYXJGb2xsb3dpbmdNb2RlbFBhcmFtZXRlcnMudjA7IC8vIGlmIHZlaGljbGUgcmVzdHJpY3RzIHNwZWVkLCB2TWF4PHZMaW1pdCwgdjBcblx0XHRjb25zb2xlLmxvZygnY29udHJ1Y3RlZCB2ZWhpY2xlIHdpdGg6ICcsIHRoaXMudmVoaWNsZVBhcmFtZXRlcnMsXG5cdFx0XHR0aGlzLmNhckZvbGxvd2luZ01vZGVsUGFyYW1ldGVycyk7XG5cdH1cblxuXHRnZXRSZWFyUG9zaXRpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMucG9zaXRpb24gLSAwLjUgKiB0aGlzLmxlbmd0aDtcblx0fTtcblxuXHRnZXRGcm9udFBvc2l0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnBvc2l0aW9uICsgMC41ICogdGhpcy5sZW5ndGg7XG5cdH07XG5cblx0dXBkYXRlQWNjZWxlcmF0aW9uKHJvYWRMYW5lKSB7XG5cdFx0Ly8gICAgICAgIHZhciBsZWFkZXJNb3ZlYWJsZSA9IHJvYWRMYW5lLmdldEZyb250VmVoaWNsZSh0aGlzLnBvc2l0aW9uKTtcblxuXHRcdHZhciBsZWFkZXJNb3ZlYWJsZSA9IHJvYWRMYW5lLmdldExlYWRlcih0aGlzKTtcblxuXHRcdC8vIFRPRE8gaWYgbm8gbGVhZGVyIGdldCBhIHByZS1kZWZpbmVkIE1vdmVhYmxlIHNldCB0byBpbmZpbml0eVxuXHRcdC8vaWYobGVhZGVyTW92ZWFibGUgPT09IG51bGwpe1xuXHRcdC8vICAgIGxlYWRlck1vdmVhYmxlID0gTW92ZWFibGUuZ2V0TW92ZWFibGVBdEluZmluaXR5KCk7XG5cdFx0Ly8gfVxuXHRcdHZhciBsZWFkZXJQb3NpdGlvbiA9IGxlYWRlck1vdmVhYmxlID8gbGVhZGVyTW92ZWFibGUucG9zaXRpb24gOiAxMDAwMDAwO1xuXHRcdHZhciBsZWFkZXJTcGVlZCA9IGxlYWRlck1vdmVhYmxlID8gbGVhZGVyTW92ZWFibGUuc3BlZWQgOiAxMDA7XG5cdFx0dmFyIGxlYWRlckxlbmd0aCA9IGxlYWRlck1vdmVhYmxlID8gbGVhZGVyTW92ZWFibGUubGVuZ3RoIDogMDtcblx0XHR2YXIgZGlzdGFuY2UgPSBsZWFkZXJQb3NpdGlvbiAtIGxlYWRlckxlbmd0aCAtIHRoaXMucG9zaXRpb247XG5cdFx0aWYgKGRpc3RhbmNlIDwgMCkge1xuXHRcdFx0ZGlzdGFuY2UgPSA0MDsgLy8gVE9ETyBqdXN0IGEgaGFjayBoZXJlXG5cdFx0XHQvL3Rocm93IG5ldyBFcnJvcignbmVnYXRpdmUgZGlzdGFuY2UnKTtcblx0XHR9XG5cblx0XHR2YXIgZWZmZWN0aXZlRGVzaXJlZFNwZWVkID0gTWF0aC5taW4odGhpcy5jYXJGb2xsb3dpbmdNb2RlbFBhcmFtZXRlcnMudjAsXG5cdFx0XHR0aGlzLnZMaW1pdCwgdGhpcy52TWF4KTtcblx0XHR0aGlzLmFjYyA9IE1vZGVscy5jYWxjdWxhdGVBY2NlbGVyYXRpb24oZGlzdGFuY2UsIHRoaXMuc3BlZWQsIGxlYWRlclNwZWVkLFxuXHRcdFx0ZWZmZWN0aXZlRGVzaXJlZFNwZWVkLCB0aGlzLmNhckZvbGxvd2luZ01vZGVsUGFyYW1ldGVycyk7XG5cdH07XG5cblx0dXBkYXRlU3BlZWRBbmRQb3NpdGlvbihkdCkge1xuXHRcdHRoaXMucG9zaXRpb24gKz0gdGhpcy5zcGVlZCAqIGR0ICsgMC41ICogdGhpcy5hY2MgKiBkdCAqIGR0O1xuXHRcdHRoaXMuc3BlZWQgKz0gdGhpcy5hY2MgKiBkdDtcblx0XHRpZiAodGhpcy5zcGVlZCA8IDApIHtcblx0XHRcdHRoaXMuc3BlZWQgPSAwO1xuXHRcdH1cblx0XHQvLyAgICAgICAgY29uc29sZS5sb2coJ3ZlaGljbGUgJywgdGhpcy5pZCwgJyAgIHBvc2l0aW9uOiAnLCB0aGlzLnBvc2l0aW9uLCAnICAgc3BlZWQ6ICcsIHRoaXMuc3BlZWQsICcgICAgYWNjOiAnLCB0aGlzLmFjYyk7XG5cdH07XG5cblx0c3RhdGljIGdldERlZmF1bHRQYXJhbWV0ZXJzKGlzVHJ1Y2sgPSBmYWxzZSkge1xuXHRcdGxldCB2ZWhpY2xlUGFyYW1ldGVycyA9IHt9O1xuXHRcdHZlaGljbGVQYXJhbWV0ZXJzLmlzVHJ1Y2sgPSBpc1RydWNrO1xuXHRcdHZlaGljbGVQYXJhbWV0ZXJzLmxlbmd0aCA9IChpc1RydWNrKSA/IDE1IDogNztcblx0XHR2ZWhpY2xlUGFyYW1ldGVycy53aWR0aCA9IChpc1RydWNrKSA/IDMgOiAyLjU7XG5cdFx0dmVoaWNsZVBhcmFtZXRlcnMucG9zaXRpb24gPSAwO1xuXHRcdHZlaGljbGVQYXJhbWV0ZXJzLnNwZWVkID0gMDtcblx0XHR2ZWhpY2xlUGFyYW1ldGVycy5hY2MgPSAwO1xuXHRcdHJldHVybiB2ZWhpY2xlUGFyYW1ldGVycztcblx0fTtcbn1cbiJdfQ==
