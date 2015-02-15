import Car from './car';
import Idm from './idm';


var longModelOptions = {
	a: 1.5,
	b: 1
};

var longModel = new Idm(longModelOptions);

var firstCar = new Car(longModel);
var secondCar = new Car(longModel);
