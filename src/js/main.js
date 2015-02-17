import {
	createRingRoad
}
from './roadNetworkFactory';
import RoadNetwork from './roadNetwork';
import RoadSegment from './roadSegment';
import raf from './raf';

// polyfill requestAnimationFrame
raf();

let dt = 0.2;
let simulationTime = 0;
let iterationCount = 0;

let running = false;
let time;
let timeWarp = 4;


let roadLength = 1000;
let numberOfLanes = 1;
let roadNetwork = createRingRoad(roadLength, numberOfLanes);

debugger;
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
