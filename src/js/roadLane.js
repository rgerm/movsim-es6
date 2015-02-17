export default class RoadLane {

	constructor(roadSegment) {
		this.vehicles = [];
		this.roadSegment = roadSegment;
		this.sinkLaneSegment = null; //TODO
		this.sourceLaneSegment = null; //TODO
	}

	getRoadLength() {
		return this.roadSegment.roadLength;
	};

	addVehicle(vehicle) {
		this.vehicles.push(vehicle);
	};

	updateVehicleAccelerations() {
		for (var i = 0, len = this.vehicles.length; i < len; i++) {
			var vehicle = this.vehicles[i];
			vehicle.updateAcceleration(this);
		}
	};

	updateSpeedAndPosition(dt) {
		for (var i = 0; i < this.vehicles.length; i++) {
			var vehicle = this.vehicles[i];
			vehicle.updateSpeedAndPosition(dt);
			if (this.roadSegment.parameters.ringRoad && vehicle.position > this.roadSegment
				.parameters.roadLength) {
				vehicle.position -= this.roadSegment.parameters.roadLength;
			}
		}
	};

	getLaneRearVehicle() {
		if (this.vehicles.length > 0) {
			return this.vehicles[this.vehicles.length - 1];
		}
		return null;
	};

	getLaneFrontVehicle() {
		if (this.vehicles.length > 0) {
			return this.vehicles[0];
		}
		return null;
	};

	getRearVehicle(position) {
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
	};

	getFrontVehicle(position) {
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
	};

	updateOutflow(dt) {
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
	};

	updateInflow(dt) {
		// TODO
	};

	_sortVehicles() {
		this.vehicles.sort(function(a, b) {
			return a.position - b.position;
		});
	};

	getLeader(vehicle) {
		var vehicleIndex = this._getPositionInArray(vehicle.id);
		if (this.vehicles.length <= 1) {
			return null;
		}
		if (vehicleIndex === this.vehicles.length - 1) {
			return this.roadSegment.ringRoad === true ? this.vehicles[0] : null;
		}
		return this.vehicles[vehicleIndex + 1];
	};

	getPositionInArray = function(id) {
		// TODO es6 -> findIndex 
		var index = this.vehicles.map(function(el) {
			return el.id;
		}).indexOf(id);
		return index;
	};

}
