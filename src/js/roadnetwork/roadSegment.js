import RoadLane from './roadLane';
import Vehicle from './../moveable/vehicle';
import IdmParameters from './../moveable/idm';

export default class RoadSegment {

	constructor(options) {
		this.parameters = options;
		this.roadLanes = [];
		this.numberOfLanes = options.numberOfLanes;

		for (let i = 1; i <= this.numberOfLanes; i++) {
			let roadLane = new RoadLane(this);
			this.roadLanes.push(roadLane);
		}

		var vehiclesInOneLane = options.roadLength * options.initDensityPerLane;
		var numberOfVehicles = Math.floor(this.numberOfLanes * vehiclesInOneLane);
		this._initializeVehicles(numberOfVehicles, options.initTruckFraction);

		console.log('constructor RoadSegment');
	}

	considerLaneChanges(dt) {}

	updateVehicleAccelerations(dt) {
		for (let i = 0; i < this.numberOfLanes; i++) {
			this.roadLanes[i].updateVehicleAccelerations(dt);
		}
	}

	updateVehiclePositionsAndSpeeds(dt) {
		for (let i = 0; i < this.numberOfLanes; i++) {
			this.roadLanes[i].updateSpeedAndPosition(dt);
		}
	}

	checkForInconsistencies(dt) {
		// TODO implement check for negative vehicle distances
	}

	updateOutflow(dt) {
		for (let i = 0; i < this.numberOfLanes; i++) {
			this.roadLanes[i].updateOutflow(dt);
		}
	}

	updateInflow(dt) {
		for (let i = 0; i < this.numberOfLanes; i++) {
			this.roadLanes[i].updateInflow(dt);
		}
	}

	static getDefaultParameters() {
		let roadSectionParameters = {};
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
	}

	_initializeVehicles(numberOfVehicles, truckFraction) {
		for (var i = 0; i < numberOfVehicles; i++) {
			var vehicleParameters = Vehicle.getDefaultParameters();
			vehicleParameters.isTruck = Math.random() < truckFraction;
			// initialize all vehicles with same speed determined by slower trucks
			vehicleParameters.speed = 0.8 * IdmParameters.getDefaultTruck()
				.v0;
			vehicleParameters.position = i * 100; // TODO init correctly
			var vehicle = new Vehicle(vehicleParameters);
			var lane = i % this.roadLanes.length;
			this.roadLanes[lane].addVehicle(vehicle);
		}
	};
}
