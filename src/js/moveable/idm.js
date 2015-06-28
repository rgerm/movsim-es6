export default class IdmParameters {

  constructor(v0 = 20, a = 1.2, b = 1.2, T = 1.5, s0 = 2, s1 = 0, delta = 4) {
    this.v0 = v0;
    this.a = a;
    this.b = b;
    this.T = T;
    this.s0 = s0;
    this.s1 = s1;
    this.delta = delta;
  }

  static getDefaultCar() {
    return new IdmParameters();
  };

  static getDefaultTruck() {
    let defaultTruck = new IdmParameters();
    defaultTruck.v0 = 0.8 * defaultTruck.v0;
    defaultTruck.a = 0.8 * defaultTruck.a;
    defaultTruck.T = 1.2 * defaultTruck.T;
    return defaultTruck;
  };

}
