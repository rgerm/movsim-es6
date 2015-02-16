export default class RoadSegment {

  constructor(lanes) {
    this.roadLanes = [];

    for (let i = 0; i < lanes; i++) {
      let roadLane = i;
      this.roadLanes.push(roadLane);
    }

    console.log('constructor RoadSegment');
  }

  considerLaneChanges(dt) {
    console.log('no lane changes');
  }

  updateVehicleAccelerations(dt) {
    console.log('updateVehicleAccelerations with dt: ', dt);
  }

  updateVehiclePositionsAndSpeeds(dt) {
    console.log('updateVehiclePositionsAndSpeeds with dt: ', dt);
  }

  checkForInconsistencies(dt) {
    console.log('checkForInconsistencies with dt: ', dt);
  }

  updateOutflow(dt) {
    console.log('updateOutflow with dt: ', dt);
  }

  updateInflow(dt) {
    console.log('updateInflow with dt: ', dt);
  }

}
