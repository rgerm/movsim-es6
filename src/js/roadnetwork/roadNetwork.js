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
    for (let roadSegment of this.roadSegments) {
      roadSegment.considerLaneChanges(dt);
    }

    for (let roadSegment of this.roadSegments) {
      roadSegment.updateVehicleAccelerations(dt);
    }

    for (let roadSegment of this.roadSegments) {
      roadSegment.updateVehiclePositionsAndSpeeds(dt);
    }

    for (let roadSegment of this.roadSegments) {
      roadSegment.checkForInconsistencies(dt);
    }

    for (let roadSegment of this.roadSegments) {
      roadSegment.updateOutflow(dt);
    }

    for (let roadSegment of this.roadSegments) {
      roadSegment.updateInflow(dt);
    }

  }

}
