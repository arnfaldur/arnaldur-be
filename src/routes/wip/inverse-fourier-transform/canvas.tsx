import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { rgbToCss, turboColormapSample } from "~/utils/colormap";

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
	constructor(x: number = 0, y: number = 0, visible: boolean = true) {
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
	scale(scale: number): Point {
		return new Point(this.x * scale, this.y * scale);
	}
	rotate(radians: number): Point {
		return this.mul(new Point(Math.cos(radians), Math.sin(radians)));
	}
	asVisible(): Point {
		return new Point(this.x, this.y, true);
	}
	asHidden(): Point {
		return new Point(this.x, this.y, false);
	}
	distance(other: Point): number {
		return Math.sqrt(
			Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2),
		);
	}
	arg(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
}

// Derived from https://en.wikipedia.org/wiki/Discrete_Fourier_transform#Definition
function dft(points: Point[]): Point[] {
	return points.map((_, k) =>
		points.reduce((acc, point, n) =>
			acc.add(
				point.mul(
					new Point(
						Math.cos(((2 * Math.PI * k) / points.length) * n),
						-Math.sin(((2 * Math.PI * k) / points.length) * n),
					),
				),
			),
		),
	);
}
function idft(points: Point[]): Point[] {
	return points.map((_, k) =>
		points
			.reduce((acc, point, n) =>
				acc.add(
					point.mul(
						new Point(
							Math.cos(((2 * Math.PI * k) / points.length) * n),
							Math.sin(((2 * Math.PI * k) / points.length) * n),
						),
					),
				),
			)
			.scale(1 / points.length),
	);
}

export function DrawingCanvas() {
	const relativeWidth = 0.9;
	const relativeHeight = 0.8;

	const strokeStyle = "white";
	const lineWidth = 0.002;

	const [points, setPoints] = createSignal<Point[]>([]);
	const [rotation, setRotation] = createSignal(0);
	const pointsDft = createMemo(() => dft(points()));
	const pointsIdft = createMemo(() => idft(points()));
	const pointsSpecial = createMemo(() =>
		pointsIdft()
			.map<[Point, number]>((point, i) => [point, i])
			.toSorted((a, b) => b[0].arg() - a[0].arg()),
	);
	const pointsAlternating = createMemo(() =>
		pointsIdft().map<[Point, number]>((_, i, arr) => {
			const ix =
				i % 2 === 0 ? Math.floor(i / 2) : arr.length - Math.ceil(i / 2);
			return [arr[ix], ix];
		}),
	);

	const pointsSelected = createMemo(() => pointsAlternating());

	createEffect(() => {
		console.log("points", points());
		console.log("dft", pointsIdft());
	});

	const setupCanvas = (canvas: HTMLCanvasElement) => {
		const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
		if (!ctx) return null;

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
			if (point.distance(lastPoint) < 0.001) return;
			setPoints([...points(), point]);
			lastPoint = point;
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

				// Scale the canvas to fit the coordinate system
				ctx.translate(canvas.width / 2, canvas.height / 2);
				ctx.scale(canvas.width / 2, -canvas.height / 2);
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

		let lastTime = performance.now();
		let rotation = 0;
		const animationLoop = (timestamp: DOMHighResTimeStamp) => {
			const deltaTime = timestamp - lastTime;
			lastTime = timestamp;
			rotation += deltaTime / 100;
			if (pointsSelected().length === 0) {
				rotation = 0;
			} else if (rotation >= pointsSelected().length) {
				rotation = rotation % pointsSelected().length;
			}

			const drawDft = (ctx: CanvasRenderingContext2D) => {
				ctx.lineWidth = lineWidth;
				ctx.strokeStyle = "red";
				let acc = new Point(0, 0);
				ctx.strokeStyle = rgbToCss(turboColormapSample(0));
				pointsSelected().forEach(([point, i], _, iPoints) => {
					const samples = iPoints.length;

					const shiftedIndex = i >= samples / 2 ? i - samples : i;

					const rads = -((2 * Math.PI) / samples) * shiftedIndex * rotation;
					ctx.beginPath();
					ctx.moveTo(acc.x, acc.y);
					acc = acc.add(point.rotate(rads));
					ctx.strokeStyle = i >= samples / 2 ? "red" : "green";
					ctx.lineTo(acc.x, acc.y);
					ctx.stroke();
					ctx.closePath();
				});
			};

			const drawDrawing = (ctx: CanvasRenderingContext2D) => {
				// Set the line width
				ctx.lineWidth = lineWidth;
				ctx.strokeStyle = strokeStyle;
				ctx.beginPath();
				ctx.moveTo(0, 0);
				for (const point of points()) {
					if (point?.visible) {
						ctx.lineTo(point.x, point.y);
					} else {
						ctx.moveTo(point.x, point.y);
					}
				}
				ctx.stroke();
				ctx.closePath();
			};

			ctx.clearRect(-1, -1, 2, 2);
			drawDft(ctx);
			drawDrawing(ctx);

			requestAnimationFrame(animationLoop);
		};
		requestAnimationFrame(animationLoop);
	};

	const resetPoints = () => {
		setPoints([]);
		/* redraw()(); */
	};
	const undoPoint = (undos: number) => {
		setPoints(points().slice(0, -undos));
		/* redraw()(); */
	};

	return (
		<>
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
			<button onClick={resetPoints}>Reset</button>
			<button onClick={() => undoPoint(1)}>Undo</button>
			<button onClick={() => undoPoint(10)}>Undo 10</button>
		</>
	);
}
/* style="width: 100%; border: 1px solid black; display: block;" */
