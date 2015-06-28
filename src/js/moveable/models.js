import IdmParameters from './idm';


let maxDeceleration = 20;

export default class Models {

  static idmCalcAcc(s, v, vl, v0eff, parameters) {
    let accFree = parameters.a * (1 - Math.pow(v / v0eff, parameters.delta));
    let sstar = parameters.s0 + v * parameters.T + parameters.s1 * Math.sqrt((v +
      0.0001) / v0eff) + 0.5 * v * (v - vl) / Math.sqrt(parameters.a *
      parameters.b);
    let accInt = -parameters.a * Math.pow(sstar / Math.max(s, parameters.s0), 2);
    return Math.max(-maxDeceleration, accFree + accInt);
  }

  static calculateAcceleration(s, v, vl, v0eff, parameters) {
    // TODO check effective speed of instanceof call
    if (parameters instanceof IdmParameters) {
      return Models.idmCalcAcc(s, v, vl, v0eff, parameters);
    } else {
      throw Error("cannot map parameters to acceleration function" + parameters.toString());
    }
  };
}
