import { Point } from "./Point";

export function circle(n: number): Point[] {
	return Array.from(
		{ length: n + 1 },
		(_, i) =>
			new Point(
				Math.cos(((i - 1) * Math.PI * 2) / n),
				Math.sin(((i - 1) * Math.PI * 2) / n),
				i !== 0,
			),
	);
}

export function spiral(n: number): Point[] {
	return Array.from({ length: n }, (_, i) =>
		new Point(
			Math.cos((i * Math.PI * 8) / n),
			Math.sin((i * Math.PI * 8) / n),
		).scale(i / n),
	);
}

export function logSpiral(n: number): Point[] {
	const thetaMax = Math.PI * 2 * 4;
	const deltaTheta = thetaMax / (n - 1);
	const [b] = [0.1];
	let result = Array.from({ length: n }, (_, i) => {
		const theta = i * deltaTheta;
		const r = Math.exp(b * theta) / Math.exp(b * (n - 1) * deltaTheta);
		const x = r * Math.cos(theta);
		const y = r * Math.sin(theta);
		return new Point(x, y).scale(0.9);
	});
	result.unshift(result[0].asHidden());
	return result;
}

export function twoPoints(n: number): Point[] {
	const scale = 0.6;
	return Array.from(
		{ length: n },
		(_, i) => new Point(i < n / 2 ? -scale : scale, i < n / 2 ? -scale : scale),
	);
}

// Heart Shape
export function heart(n: number): Point[] {
	let points: Point[] = [];

	for (let i = 0; i < n; i++) {
		const t = (i * 2 * Math.PI) / (n - 1);
		const x = 16 * Math.sin(t) ** 3;
		const y =
			13 * Math.cos(t) -
			5 * Math.cos(2 * t) -
			2 * Math.cos(3 * t) -
			Math.cos(4 * t);
		points.push(new Point(x / 20, y / 20));
	}

	points.unshift(points[0].asHidden());
	return points;
}

// Wave Pattern
export function wave(n: number): Point[] {
	const amplitude = 0.5;
	const frequency = 8;
	const points = Array.from({ length: n }, (_, i) => {
		const x = (i * 2) / (n - 1) - 1;
		const y = amplitude * Math.sin(frequency * Math.PI * x);
		return new Point(x, y).scale(0.9);
	});

	points.unshift(points[0].asHidden());
	return points;
}
/**
 * Generates points on a Hilbert curve, with coordinates in the range [-0.9, 0.9]
 * @param numPoints The function will use the largest power of 4 less than or equal to this number
 * @returns An array of Points representing the Hilbert curve
 */
export function hilbert(numPoints: number): Point[] {
	// Find the largest power of 4 less than or equal to numPoints
	const order = Math.floor(Math.log(numPoints) / Math.log(4));
	const actualPoints = Math.pow(4, order);

	const points: Point[] = [];
	const size = 1 << order; // 2^order is the size of one dimension

	// Generate all points on the curve
	for (let i = 0; i < actualPoints; i++) {
		// Convert index to (x, y) coordinates
		const point = hilbertIndexToXY(order, i);

		// Normalize coordinates to [-0.9, 0.9]
		const normalizedPoint = point
			.scale(1.8 / (size - 1))
			.sub(new Point(0.9, 0.9));

		points.push(normalizedPoint);
	}

	points.unshift(points[0].asHidden());
	return points;
}

/**
 * Converts a 1D Hilbert curve index to 2D (x, y) coordinates
 * @param order The order of the Hilbert curve
 * @param index The index along the curve
 * @returns A tuple of [x, y] coordinates
 */
function hilbertIndexToXY(order: number, index: number): Point {
	let x = 0,
		y = 0;

	for (let s = 1, t = index; s < 1 << order; s *= 2) {
		const rx = (t >> 1) & 1;
		const ry = (t ^ rx) & 1;

		// Rotate and flip quadrants as needed
		if (ry === 0) {
			if (rx === 1) {
				x = s - 1 - x;
				y = s - 1 - y;
			}

			// Swap x and y
			[x, y] = [y, x];
		}

		// Add offset for the current quadrant
		x += s * rx;
		y += s * ry;

		// Move to next quadrant
		t >>= 2;
	}

	return new Point(x, y);
}

export function moore(n: number): Point[] {
	// Calculate depth as log base 4 of n, rounded down
	const depth = Math.floor(Math.log(n) / Math.log(4));
	// const step = 1 << (Math.floor(Math.log2(n / 2)) * 1);
	const step = 1 << depth;

	const points: Point[] = [];
	const state = { x: 0, y: 0, dx: 0, dy: 1 };

	// L production rule: L → −RF+LFL+FR−
	function L(
		depth: number,
		points: Point[],
		state: { x: number; y: number; dx: number; dy: number },
	): void {
		if (depth === 0) {
			return; // Base case, L doesn't draw anything directly
		}

		turnLeft(state);
		R(depth - 1, points, state);
		F(points, state);
		turnRight(state);
		L(depth - 1, points, state);
		F(points, state);
		L(depth - 1, points, state);
		turnRight(state);
		F(points, state);
		R(depth - 1, points, state);
		turnLeft(state);
	}

	// R production rule: R → +LF−RFR−FL+
	function R(
		depth: number,
		points: Point[],
		state: { x: number; y: number; dx: number; dy: number },
	): void {
		if (depth === 0) {
			return; // Base case, R doesn't draw anything directly
		}

		turnRight(state);
		L(depth - 1, points, state);
		F(points, state);
		turnLeft(state);
		R(depth - 1, points, state);
		F(points, state);
		R(depth - 1, points, state);
		turnLeft(state);
		F(points, state);
		L(depth - 1, points, state);
		turnRight(state);
	}

	// F: Draw forward
	function F(
		points: Point[],
		state: { x: number; y: number; dx: number; dy: number },
	): void {
		// Add current position to points
		points.push(new Point(state.x, state.y));

		// Move forward
		state.x += state.dx;
		state.y += state.dy;
	}

	// Turn right 90° (clockwise)
	function turnRight(state: { dx: number; dy: number }): void {
		const temp = state.dx;
		state.dx = -state.dy;
		state.dy = temp;
	}

	// Turn left 90° (counterclockwise)
	function turnLeft(state: { dx: number; dy: number }): void {
		const temp = state.dx;
		state.dx = state.dy;
		state.dy = -temp;
	}

	// Direct implementation of the axiom LFL+F+LFL
	// Each symbol is implemented as a function call
	L(depth, points, state);
	F(points, state);
	L(depth, points, state);
	turnRight(state);
	F(points, state);
	turnRight(state);
	L(depth, points, state);
	F(points, state);
	L(depth, points, state);
	turnRight(state);
	F(points, state);
	F(points, state);

	points.unshift(points[0].asHidden());
	return points.map((p) => p.sub(new Point(-0.5, step - 0.5)).scale(1 / step));
}
