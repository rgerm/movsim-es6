export default class RoadNetwork {


	constructor() {
		this.roadSegments = [];
		console.log('contructor RoadNetwork')
	}

	addRoadSegment(roadSegment) {
		this.roadSegments.push(roadSegment);
		console.log('  added ', roadSegment, ' to roadNetwork', this.roadSegments);
	}

	timeStep(dt) {

		this.roadSegments.forEach(function(roadSegmet) {
			roadSegmet.considerLaneChanges(dt);
		});

		this.roadSegments.forEach(function(roadSegmet) {
			roadSegmet.updateVehicleAccelerations(dt);
		});

		this.roadSegments.forEach(function(roadSegmet) {
			roadSegmet.updateVehiclePositionsAndSpeeds(dt);
		});

		// for debugging
		this.roadSegments.forEach(function(roadSegmet) {
			roadSegmet.checkForInconsistencies(dt);
		});

		this.roadSegments.forEach(function(roadSegmet) {
			roadSegmet.updateOutflow(dt);
		});

		this.roadSegments.forEach(function(roadSegmet) {
			roadSegmet.updateInflow(dt);
		});

	}
}
