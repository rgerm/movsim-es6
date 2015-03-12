import {
	getImage
}
from './resources';


// TODO replace fixed scale numbers
var scaleFactorImg = 1;
var center_x = 0.50 * 1000 * scaleFactorImg;
var center_y = 0.48 * 800 * scaleFactorImg;
var scale = 1.2;

export default class Renderer {

	constructor(network) {
		this.roadNetwork = network;
		this.canvas = document.getElementById("animation-canvas");
		this.ctx = this.canvas.getContext("2d");

		let width = this.canvas.width = 1000; //backgroundImage.width;
		let height = this.canvas.height = 500; // backgroundImage.height;

		this.car = getImage('car1');
		this.truck = getImage('truck1');
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};

	drawBackground() {
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.fillStyle = "#113366";

		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawRoads() {

	}

	drawVehicles(roadNetwork) {
		for (let i = 0; i < roadNetwork.roadSegments.length; i++) {
			let roadSegment = roadNetwork.roadSegments[i];
			for (let j = 0; j < roadSegment.roadLanes.length; j++) {
				let roadLane = roadSegment.roadLanes[j];
				for (let k = 0; k < roadLane.vehicles.length; k++) {
					let vehicle = roadLane.vehicles[k];

					// TODO calculate correct screen coordinates from roadSegment geometry
					var x = vehicle.position; // ringroad !!
					var y = roadSegment.parameters.globalY;
					var vehImage = vehicle.isTruck ? this.truck : this.car;
					this.ctx.setTransform(1, 0, 0, 1, 0, 0);
					var scaleImg = scale * scaleFactorImg;
					this.ctx.drawImage(vehImage, x, y, scaleImg * 30, scaleImg * 20);
				}
			}
		}
	}

}
