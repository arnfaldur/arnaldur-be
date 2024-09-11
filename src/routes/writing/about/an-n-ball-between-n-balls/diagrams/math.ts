export const sin = Math.sin;
export const cos = Math.cos;
export const tan = Math.tan;
export const sec = (x: number) => 1 / cos(x);
export const csc = (x: number) => 1 / sin(x);
export const cot = (x: number) => 1 / tan(x);


export const asin = Math.asin;
export const acos = Math.acos;
export const atan = Math.atan;
export const asec = (x: number) => 1 / acos(x);
export const acsc = (x: number) => 1 / asin(x);
export const acot = (x: number) => 1 / atan(x);
