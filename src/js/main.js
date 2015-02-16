import RoadNetwork from './roadNetwork';
import RoadSegment from './raodSegment';
import raf from './raf';

raf();

let dt = 0.2;
let simulationTime = 0;
let iterationCount = 0;

let running = false;
let time;
let timeWarp = 4;

let roadNetwork = new RoadNetwork();

let roadSegment1 = new RoadSegment(1);
let roadSegment2 = new RoadSegment(3);

roadNetwork.addRoadSegment(roadSegment1);
roadNetwork.addRoadSegment(roadSegment2);


start();

function start() {
  running = true;
  time = new Date().getTime();
  mainLoop();
}

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

    // limit iterations for now
    if (iterationCount >= 5) {
      running = false;
    }

  } else {
    console.log('timeStep: ', dt, ' -- simTime: ', simulationTime,
      ' -- iterationcount: ', iterationCount);
  }

}
