export const sine = Math.sin;
export const cosine = Math.cos;
export const tangent = Math.tan;
export const secant = (x: number) => 1 / cosine(x);
export const cosecant = (x: number) => 1 / sine(x);
export const cotangent = (x: number) => 1 / tangent(x);
