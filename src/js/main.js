import {
	createRingRoad
}
from './roadNetworkFactory';
import RoadNetwork from './roadNetwork';
import RoadSegment from './roadSegment';
import raf from './raf';
import Renderer from './renderer';
import {
	loadResources
}
from './resources';


// polyfill requestAnimationFrame
raf();

// dt is dynamically changed. See mainLoop.
let dt = 0.2;
let simulationTime = 0;
let iterationCount = 0;

let running = false;
let time;
let timeWarp = 4;

let renderer;
let roadNetwork;

loadResources(function() {
	let roadLength = 1000;
	let numberOfLanes = 1;
	roadNetwork = createRingRoad(roadLength, numberOfLanes);

	renderer = new Renderer(roadNetwork);
	renderer.drawRoads();
	renderer.drawBackground();

	start();
});

function start() {
	running = true;
	time = new Date().getTime();
	mainLoop();
}

function stop() {
	running = false;
};

function reset() {
	dt = 0.2;
	simulationTime = 0;
	iterationCount = 0;
};

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
		renderer.clear();
		renderer.drawBackground();
		renderer.drawRoads();
		renderer.drawVehicles(roadNetwork);

		// limit iterations for now
		if (iterationCount >= 1000) {
			running = false;

			roadNetwork.roadSegments[0].roadLanes[0].vehicles.forEach(function(vehicle) {
				console.log('vehicle: ', vehicle.id, '  pos: ', vehicle.position.toFixed(
					2), '  speed: ', vehicle.speed.toFixed(2), '  acc: ', vehicle.acc.toFixed(
					4), '   a: ', vehicle.carFollowingModelParameters.a);
			});
		}

		if (iterationCount % 100 === 0) {
			console.log('timeStep: ', dt, ' -- simTime: ', simulationTime,
				' -- iterationcount: ', iterationCount);

			roadNetwork.roadSegments[0].roadLanes[0].vehicles.forEach(function(vehicle) {
				console.log('vehicle: ', vehicle.id, '  pos: ', vehicle.position.toFixed(
					2), '  speed: ', vehicle.speed.toFixed(2), '  acc: ', vehicle.acc.toFixed(
					4), '   a: ', vehicle.carFollowingModelParameters.a);
			});
		}


	} else {
		console.log('timeStep: ', dt, ' -- simTime: ', simulationTime,
			' -- iterationcount: ', iterationCount);
	}

}
