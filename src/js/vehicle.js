var numberOfCreatedVehicles = 0;

export default class Vehicle {

	constructor(vehicleParameters) {
		this.vehicleParameters = vehicleParameters;
		console.log('contructed vehicle with: ', vehicleParameters);
	}

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
