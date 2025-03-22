import { createEffect, createSignal, onCleanup } from "solid-js";

/* type Point = { x: number; y: number; visible?: boolean }; */

class Point {
	x: number;
	y: number;
	visible: boolean;
	/* constructor({ x, y, visible }: { x: number; y: number; visible?: boolean }) {
		this.x = x;
		this.y = y;
		this.visible = visible;
	} */
	constructor(x: number, y: number, visible: boolean = true) {
		this.x = x;
		this.y = y;
		this.visible = visible;
	}
	add(other: Point): Point {
		return new Point(this.x + other.x, this.y + other.y);
	}
	mul(other: Point): Point {
		return new Point(
			this.x * other.x - this.y * other.y,
			this.x * other.y + this.y * other.x,
		);
	}
	asVisible(): Point {
		return new Point(this.x, this.y, true);
	}
	asHidden(): Point {
		return new Point(this.x, this.y, false);
	}
}

function distance(a: Point, b: Point): number {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/* function dft(points: Point[]): Point[] {
 * 	return points.map((pointA) =>
 * 		points.reduce((acc, pointB, i) => acc.add(pointB.mul())),
 * 	);
 * }
 *  */
export function DrawingCanvas() {
	const relativeWidth = 0.9;
	const relativeHeight = 0.8;

	const [points, setPoints] = createSignal<Point[]>([]);

	createEffect(() => {
		console.log("points", points());
	});

	const setupCanvas = (canvas: HTMLCanvasElement) => {
		const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
		if (!ctx) return null;

		const strokeStyle = "white";
		const lineWidth = 0.002;

		let isDrawing = false;
		let lastPoint = new Point(0, 0);

		// Scale the canvas to fit the desired coordinate system
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.scale(canvas.width / 2, -canvas.height / 2);

		const startDrawing = (event: MouseEvent) => {
			isDrawing = true;
			const point = getMousePosition(event);
			setPoints([...points(), point.asHidden()]);
			setPoints([...points(), point.asVisible()]);
			lastPoint = point;
		};

		const draw = (event: MouseEvent) => {
			if (!isDrawing) return;
			const point = getMousePosition(event);
			if (distance(point, lastPoint) < 0.01) return;
			setPoints([...points(), point]);
			ctx.beginPath();
			ctx.moveTo(lastPoint.x, lastPoint.y);
			lastPoint = point;
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = strokeStyle;
			ctx.lineTo(point.x, point.y);
			ctx.stroke();
			ctx.closePath();
		};

		const stopDrawing = () => {
			isDrawing = false;
		};

		const getMousePosition = (event: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x =
				(event.clientX - rect.left - canvas.width / 2) / (canvas.width / 2);
			const y =
				-(event.clientY - rect.top - canvas.height / 2) / (canvas.height / 2);
			return new Point(x, y);
		};

		const resizeCanvas = () => {
			const width = Math.min(
				window.innerWidth * relativeWidth,
				window.innerHeight * relativeHeight,
			);
			const height = width;

			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;

				// Scale the canvas to fit the desired coordinate system
				ctx.translate(canvas.width / 2, canvas.height / 2);
				ctx.scale(canvas.width / 2, -canvas.height / 2);

				// Redraw the existing points
				ctx.clearRect(-1, -1, 2, 2);
				// Set the line width
				ctx.lineWidth = lineWidth;
				ctx.strokeStyle = strokeStyle;
				ctx.beginPath();
				for (const point of points()) {
					if (point?.visible) {
						ctx.lineTo(point.x, point.y);
					} else {
						ctx.moveTo(point.x, point.y);
					}
				}
				ctx.stroke();
			}
		};

		canvas.addEventListener("mousedown", startDrawing);
		canvas.addEventListener("mousemove", draw);
		canvas.addEventListener("mouseup", stopDrawing);
		canvas.addEventListener("mouseout", stopDrawing);

		window.addEventListener("resize", resizeCanvas);

		onCleanup(() => {
			canvas.removeEventListener("mousedown", startDrawing);
			canvas.removeEventListener("mousemove", draw);
			canvas.removeEventListener("mouseup", stopDrawing);
			canvas.removeEventListener("mouseout", stopDrawing);

			window.removeEventListener("resize", resizeCanvas);
		});

		resizeCanvas();
	};

	return (
		<canvas
			ref={setupCanvas}
			width="400"
			height="400"
			style={{
				/* width: "99vw", */
				border: "1px solid black",
				position: "relative",
				left: "50%",
				"margin-left": `max(-${relativeWidth * 50}vw, -${relativeHeight * 50}vh)`,
			}}
		/>
	);
}

/* style="width: 100%; border: 1px solid black; display: block;" */
