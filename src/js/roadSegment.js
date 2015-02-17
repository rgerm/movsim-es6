import RoadLane from './roadLane';

export default class RoadSegment {

	constructor(options) {
		this.roadLanes = [];
		debugger;
		for (let i = 1; i <= options.numberOfLanes; i++) {
			let roadLane = new RoadLane(this);
			this.roadLanes.push(roadLane);
		}

		console.log('constructor RoadSegment');
	}

	considerLaneChanges(dt) {
		console.log('no lane changes');
	}

	updateVehicleAccelerations(dt) {
		console.log('updateVehicleAccelerations with dt: ', dt);
		for (let i = 0; i < lanes; i++) {
			this.roadLanes[i].updateVehicleAccelerations(dt);
		}
	}

	updateVehiclePositionsAndSpeeds(dt) {
		console.log('updateVehiclePositionsAndSpeeds with dt: ', dt);
		for (let i = 0; i < lanes; i++) {
			this.roadLanes[i].updateVehiclePositionsAndSpeeds(dt);
		}
	}

	checkForInconsistencies(dt) {
		console.log('checkForInconsistencies with dt: ', dt);
		// TODO implement check for negative vehicle distances
	}

	updateOutflow(dt) {
		console.log('updateOutflow with dt: ', dt);
		for (let i = 0; i < lanes; i++) {
			this.roadLanes[i].updateOutflow(dt);
		}
	}

	updateInflow(dt) {
		console.log('updateInflow with dt: ', dt);
		for (let i = 0; i < lanes; i++) {
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
}
