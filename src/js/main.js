import RoadNetwork from './roadNetwork';
import RoadSegment from './raodSegment';


let roadNetwork = new RoadNetwork();

let roadSegment1 = new RoadSegment(1);
let roadSegment2 = new RoadSegment(3);

roadNetwork.addRoadSegment(roadSegment1);
roadNetwork.addRoadSegment(roadSegment2);
