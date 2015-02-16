export default class RoadSegment {

  constructor(lanes) {
    this.roadLanes = [];

    for (let i = 0; i < lanes; i++) {
      var roadLane = i;
      this.roadLanes.push(roadLane);
    }

    console.log('constructor RoadSegment');
  }

}
