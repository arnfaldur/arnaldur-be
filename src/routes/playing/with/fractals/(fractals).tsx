import { MandelbrotCanvas } from "./canvas";

export const title = "Mandelbrot Set";
export const date = new Date("2026-04-01T00:00:00.000Z");
export const topic = ["programming", "mathematics"];

import "./fractals.css";

export default function Component() {
	return <MandelbrotCanvas />;
}
