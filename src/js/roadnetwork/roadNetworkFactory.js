import RoadNetwork from './roadNetwork';
import RoadSegment from './roadSegment';

export function createRingRoad(roadLength, numberOfLanes) {
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
