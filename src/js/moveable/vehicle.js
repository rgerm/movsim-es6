import IdmParameters from './idm';
import Models from './models';

var numberOfCreatedVehicles = 0;

export default class Vehicle {

	constructor(vehicleParameters) {
		this.vehicleParameters = vehicleParameters || getDefaultParameters();

		// public variables
		this.id = ++numberOfCreatedVehicles;
		this.isTruck = vehicleParameters.isTruck;
		this.length = vehicleParameters.length;
		this.width = vehicleParameters.width;
		this.position = vehicleParameters.position;
		this.speed = vehicleParameters.speed;
		this.acc = vehicleParameters.acc;
		this.carFollowingModelParameters = vehicleParameters.isTruck ? IdmParameters
			.getDefaultTruck() : IdmParameters.getDefaultCar();
		this.vLimit = this.carFollowingModelParameters.v0; // if effective speed limits, vLimit<v0
		this.vMax = this.carFollowingModelParameters.v0; // if vehicle restricts speed, vMax<vLimit, v0
		console.log('contructed vehicle with: ', this.vehicleParameters,
			this.carFollowingModelParameters);
	}

	getRearPosition() {
		return this.position - 0.5 * this.length;
	};

	getFrontPosition() {
		return this.position + 0.5 * this.length;
	};

	updateAcceleration(roadLane) {
		//        var leaderMoveable = roadLane.getFrontVehicle(this.position);

		var leaderMoveable = roadLane.getLeader(this);

		// TODO if no leader get a pre-defined Moveable set to infinity
		//if(leaderMoveable === null){
		//    leaderMoveable = Moveable.getMoveableAtInfinity();
		// }
		var leaderPosition = leaderMoveable ? leaderMoveable.position : 1000000;
		var leaderSpeed = leaderMoveable ? leaderMoveable.speed : 100;
		var leaderLength = leaderMoveable ? leaderMoveable.length : 0;
		var distance = leaderPosition - leaderLength - this.position;
		if (distance < 0) {
			distance = 40; // TODO just a hack here
			//throw new Error('negative distance');
		}

		var effectiveDesiredSpeed = Math.min(this.carFollowingModelParameters.v0,
			this.vLimit, this.vMax);
		this.acc = Models.calculateAcceleration(distance, this.speed, leaderSpeed,
			effectiveDesiredSpeed, this.carFollowingModelParameters);
	};

	updateSpeedAndPosition(dt) {
		this.position += this.speed * dt + 0.5 * this.acc * dt * dt;
		this.speed += this.acc * dt;
		if (this.speed < 0) {
			this.speed = 0;
		}
		//        console.log('vehicle ', this.id, '   position: ', this.position, '   speed: ', this.speed, '    acc: ', this.acc);
	};

	static getDefaultParameters(isTruck = false) {
		let vehicleParameters = {};
		vehicleParameters.isTruck = isTruck;
		vehicleParameters.length = (isTruck) ? 15 : 7;
		vehicleParameters.width = (isTruck) ? 3 : 2.5;
		vehicleParameters.position = 0;
		vehicleParameters.speed = 0;
		vehicleParameters.acc = 0;
		return vehicleParameters;
	};
}
