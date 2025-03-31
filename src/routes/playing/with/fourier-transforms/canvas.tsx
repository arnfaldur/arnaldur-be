import { For } from "solid-js";
import { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup, Setter } from "solid-js";

import { rgbToCss, turboColormapSample } from "~/utils/colormap";
import { Point } from "./Point";
import { ifft, idft, gifft, shuffleArray } from "./fourier-transforms";
import { Checkbox, Slider } from "./components";
import * as drawings from "./drawings";

type Ordering = "default" | "insideOut" | "alternating" | "bySize" | "byAngle" | "shuffled";

const orderingData: { [key in Ordering]: string } = {
	default: "Default",
	insideOut: "Inside Out",
	alternating: "Alternating",
	bySize: "By Size",
	byAngle: "By Angle",
	shuffled: "Shuffled",
};

export function DrawingCanvas() {
	const relativeWidth = 0.99;
	const relativeHeight = 0.7;

	const strokeStyle = "white";
	const lineWidth = 2;

	const [points, setPoints] = createSignal<Point[]>([]);
	const [rotation, setRotation] = createSignal(0);
	const [pauseRotation, setPauseRotation] = createSignal(false);
	const [unscaledRotationRate, setUnscaledRotationRate] = createSignal(0.5);
	const [pointOrdering, setPointOrdering] = createSignal<Ordering>("alternating");
	const [pointOrderingReversed, setPointOrderingReversed] = createSignal<boolean>(false);
	const [connectEnds, setConnectEnds] = createSignal<boolean>(false);
	const [drawingParameter, setDrawingParameter] = createSignal(128);
	setPoints(drawings.s(Math.pow(2, 5)-1));
	setConnectEnds(true);

	const rotationRate = () => Math.pow(2, unscaledRotationRate() * 12 - 14) - Math.pow(2, -14);

	const visiblePoints = createMemo(() => points().filter((point) => point.visible));

	const pointsIfft = createMemo(() =>
		gifft(visiblePoints()).map<[Point, number]>((point, i) => [point, i]),
	);
	const pointsSelectedIfft = createPointOrderings(
		pointsIfft,
		pointOrdering,
		pointOrderingReversed,
	);

	const setupCanvas = (canvas: HTMLCanvasElement) => {
		const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
		if (!ctx) return null;

		const reScale = window?.devicePixelRatio ?? 1;
		// Scale the canvas to fit the desired coordinate system
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.scale((canvas.width / 2) * reScale, (-canvas.height / 2) * reScale);

		attachDrawingLogic(canvas, points, setPoints);

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

		window.addEventListener("resize", resizeCanvas);
		onCleanup(() => {
			window.removeEventListener("resize", resizeCanvas);
		});

		resizeCanvas();

		let lastTime = performance.now();
		const animationLoop = (timestamp: DOMHighResTimeStamp) => {
			const deltaTime = timestamp - lastTime;
			lastTime = timestamp;
			setRotation((rotation) => rotation + deltaTime * rotationRate());
			if (pointsSelectedIfft().length === 0) {
				setRotation(0);
			} else if (rotation() >= pointsSelectedIfft().length) {
				setRotation((rotation) => rotation % pointsSelectedIfft().length);
			}

			ctx.clearRect(-1, -1, 2, 2);

			ctx.lineWidth = lineWidth / (ctx.canvas.height ?? 400);
			/* drawDft(ctx, pointsSelectedIdft(), rotation()); */
			drawDft(ctx, pointsSelectedIfft, rotation());
			ctx.strokeStyle = strokeStyle;
			drawPoints(ctx, points(), connectEnds());

			requestAnimationFrame(animationLoop);
		};
		requestAnimationFrame(animationLoop);
	};

	const undoPoint = (undos: number) => {
		setPoints(points().slice(0, -undos));
		/* redraw()(); */
	};

	const [positionSlider, setPositionSlider] = createSignal({} as HTMLInputElement);
	const [animationSpeedSlider, setAnimationSpeedSlider] = createSignal({} as HTMLInputElement);
	const [connectEndsCheckbox, setConnectEndsCheckbox] = createSignal({} as HTMLInputElement);
	/* let positionSlider!: HTMLInputElement;
	let animationSpeedSlider!: HTMLInputElement; */
	createEffect(() => {
		const slider = positionSlider();
		if (slider && unscaledRotationRate() > 0)
			slider.value = (rotation() / pointsSelectedIfft().length).toString();
	});
	createEffect(() => {
		const slider = animationSpeedSlider();
		if (slider) slider.value = unscaledRotationRate().toString();
	});
	createEffect(() => {
		const checkbox = connectEndsCheckbox();
		if (checkbox) checkbox.checked = connectEnds();
	});

	/* positionSlider.addEventListener("mousedown", () => {
		setUnscaledRotationRate(0);
	});
	positionSlider.addEventListener("touchstart", () => {
		setUnscaledRotationRate(0);
	});
 */
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
			<fieldset style={{ display: "grid", grid: "auto-flow dense / 0fr 1fr", gap: "0 1rem" }}>
				<legend>Animation speed</legend>
				Progress
				<input
					ref={(el) => {
						setRotation(Number(el.value) * pointsSelectedIfft().length);
						setPositionSlider(el);
					}}
					type="range"
					value={0}
					max={1}
					step="any"
					style={{
						width: "100%",
						margin: "0 auto 0.75rem auto",
					}}
					onInput={(v) => {
						setUnscaledRotationRate(0);
						setRotation(Number(v.target.value) * pointsSelectedIfft().length);
					}}
				/>
				Speed
				<Slider
					ref={setAnimationSpeedSlider}
					value={0.5}
					setValue={setUnscaledRotationRate}
				/>
			</fieldset>

			<div
				style={{
					display: "grid",
					"grid-template-columns": "1fr 1fr 1fr",
				}}
			>
				<OrderingFieldset
					setPointOrdering={setPointOrdering}
					setPointOrderingReversed={setPointOrderingReversed}
				/>
				<fieldset>
					<legend>Drawings</legend>
					<div
						style={{
							display: "grid",
						}}
					>
						<span
							style={{
								display: "grid",
								grid: "auto-flow dense/ 0fr 1fr",
								gap: "1rem",
								"align-items": "center",
							}}
						>
							Parameter:
							<input
								type="number"
								value={128}
								min={1}
								onInput={(e) => setDrawingParameter(Number(e.target.value))}
							/>
						</span>
						<For
							each={[
								{ title: "Circle", drawing: drawings.circle, connectEnds: true },
								{ title: "Spiral", drawing: drawings.spiral, connectEnds: false },
								{
									title: "Log Spiral",
									drawing: drawings.logSpiral,
									connectEnds: false,
								},
								{
									title: "Two Points",
									drawing: drawings.twoPoints,
									connectEnds: false,
								},
								{ title: "Heart", drawing: drawings.heart, connectEnds: true },
								{ title: "Wave", drawing: drawings.wave, connectEnds: false },
								{ title: "S", drawing: drawings.s, connectEnds: true },
								{
									title: "Infinity",
									drawing: drawings.infinity,
									connectEnds: true,
								},
								{
									title: "Infinity (Geometric)",
									drawing: drawings.infinityGeometric,
									connectEnds: true,
								},
								{ title: "Hilbert", drawing: drawings.hilbert, connectEnds: false },
								{ title: "Moore", drawing: drawings.moore, connectEnds: true },
							]}
						>
							{({ title, drawing, connectEnds }) => (
								<button
									onClick={() => {
										setConnectEnds(connectEnds);
										setPoints(drawing(drawingParameter()));
									}}
								>
									{title}
								</button>
							)}
						</For>
					</div>
				</fieldset>
				<fieldset>
					<legend>Misc</legend>
					<div
						style={{
							display: "grid",
							"grid-template-rows": "1fr 1fr 1fr",
						}}
					>
						<button onClick={() => undoPoint(1)}>Undo</button>
						<button onClick={() => undoPoint(10)}>Undo 10</button>
						<button type="reset" onClick={() => setPoints([])}>
							Reset
						</button>
						<label>
							<input
								ref={setConnectEndsCheckbox}
								type="checkbox"
								onInput={(e) => setConnectEnds(e.target.checked)}
							></input>
							Connect Ends
						</label>
					</div>
				</fieldset>
			</div>
		</>
	);
}

function OrderingFieldset({
	setPointOrdering,
	setPointOrderingReversed,
}: {
	setPointOrdering: Setter<Ordering>;
	setPointOrderingReversed: Setter<boolean>;
}) {
	return (
		<fieldset>
			<legend>Ordering</legend>
			<div
				style={{
					display: "grid",
					"grid-template-columns": "1fr",
				}}
			>
				<For each={Object.entries(orderingData)}>
					{([ordering, description], i) => (
						<label>
							<input
								type="radio"
								name="ordering"
								value={ordering}
								onInput={(el) =>
									setPointOrdering((previous) => el.target.value as Ordering)
								}
								checked={ordering === "alternating"}
							/>
							{description}
						</label>
					)}
				</For>
				<Checkbox setValue={setPointOrderingReversed}>Reversed</Checkbox>
			</div>
		</fieldset>
	);
}

function drawPoints(ctx: CanvasRenderingContext2D, points: Point[], connectEnds: boolean) {
	ctx.beginPath();
	ctx.moveTo(0, 0);
	for (const point of points) {
		if (point?.visible) {
			ctx.lineTo(point.x, point.y);
		} else {
			ctx.moveTo(point.x, point.y);
		}
	}
	if (connectEnds && points.length >= 2) ctx.lineTo(points[0].x, points[0].y);
	ctx.stroke();
	ctx.closePath();
}

function createPointOrderings(
	points: Accessor<[Point, number][]>,
	pointOrdering: Accessor<Ordering>,
	pointOrderingReversed: Accessor<boolean>,
) {
	const pointsAlternating = createMemo(() =>
		points().map<[Point, number]>((_, i, arr) => {
			const ix = i % 2 === 0 ? Math.floor(i / 2) : arr.length - Math.ceil(i / 2);
			return [arr[ix][0], ix];
		}),
	);
	const pointsInsideOut = createMemo(() => [
		...points().slice(Math.ceil(points().length / 2)),
		...points().slice(0, Math.ceil(points().length / 2)),
	]);
	const pointsBySize = createMemo(() => points().toSorted((a, b) => b[0].abs() - a[0].abs()));
	const pointsByAngle = createMemo(() => points().toSorted((a, b) => b[0].arg() - a[0].arg()));
	const pointsShuffled = () => shuffleArray(points().slice());
	/* const [pointsShuffled, setPointsShuffled] = createSignal()
	const updatePointsShuffled = () => {
		setPointsShuffled(shuffleArray(points().slice()));
	}; */

	const pointsSelected = createMemo(() => {
		const mapping: {
			[key in Ordering]: Accessor<[Point, number][]>;
		} = {
			default: points,
			insideOut: pointsInsideOut,
			alternating: pointsAlternating,
			bySize: pointsBySize,
			byAngle: pointsByAngle,
			shuffled: pointsShuffled,
		};
		const result = mapping[pointOrdering()]();
		return pointOrderingReversed() ? result.toReversed() : result;
	});
	return pointsSelected;
}

function drawDft(
	ctx: CanvasRenderingContext2D,
	pointsSelected: Accessor<[Point, number][]>,
	rotation: number,
) {
	let acc = new Point(0, 0);
	ctx.strokeStyle = rgbToCss(turboColormapSample(0));
	/* for (const [point, i] of pointsSelected) {

	} */
	pointsSelected().forEach(([point, i]) => {
		const samples = pointsSelected().length;

		const shiftedIndex = i >= samples / 2 ? i - samples : i;

		const rads = -((2 * Math.PI) / samples) * shiftedIndex * rotation;
		ctx.beginPath();
		ctx.moveTo(acc.x, acc.y);
		acc = acc.add(point.rotate(rads));
		/* ctx.strokeStyle = i >= samples / 2 ? "red" : "green"; */
		ctx.strokeStyle =
			i === 0
				? `color-mix(in lch, ${rgbToCss(turboColormapSample(0.1))}, ${rgbToCss(
						turboColormapSample(0.9),
				  )})`
				: rgbToCss(turboColormapSample((i / samples) * 0.8 + 0.1));
		ctx.lineTo(acc.x, acc.y);
		ctx.stroke();
		ctx.closePath();
	});
}

function attachDrawingLogic(
	canvas: HTMLCanvasElement,
	points: Accessor<Point[]>,
	setPoints: Setter<Point[]>,
) {
	let lastPoint = new Point(0, 0);
	let isDrawing = false;

	const startDrawing = (event: MouseEvent | TouchEvent) => {
		isDrawing = true;
		const point = getPosition("touches" in event ? event.touches[0] : event);
		if (!point) {
			stopDrawing();
			return;
		}
		setPoints([...points(), point.asHidden()]);
		setPoints([...points(), point.asVisible()]);
		lastPoint = point;
	};

	const draw = (event: MouseEvent | TouchEvent) => {
		event.preventDefault();
		if (!isDrawing) return;
		const point = getPosition("touches" in event ? event.touches[0] : event);
		if (!point) {
			stopDrawing();
			return;
		}
		if (point.distance(lastPoint) < 0.01) return;
		setPoints([...points(), point]);
		lastPoint = point;
	};

	const stopDrawing = () => {
		isDrawing = false;
	};

	const getPosition = (event: MouseEvent | Touch): Point | null => {
		const rect = canvas.getBoundingClientRect();
		const x = (event.clientX - rect.left - canvas.width / 2) / (canvas.width / 2);
		const y = -(event.clientY - rect.top - canvas.height / 2) / (canvas.height / 2);
		const result = new Point(x, y);
		return result.inBounds() ? result : null;
	};

	canvas.addEventListener("mousedown", startDrawing);
	canvas.addEventListener("touchstart", startDrawing);
	canvas.addEventListener("mousemove", draw);
	canvas.addEventListener("touchmove", draw);
	canvas.addEventListener("mouseup", stopDrawing);
	canvas.addEventListener("touchend", stopDrawing);
	canvas.addEventListener("mouseout", stopDrawing);
	canvas.addEventListener("touchcancel", stopDrawing);
	canvas.addEventListener("mouseleave", stopDrawing);
	onCleanup(() => {
		canvas.removeEventListener("mousedown", startDrawing);
		canvas.removeEventListener("touchstart", startDrawing);
		canvas.removeEventListener("mousemove", draw);
		canvas.removeEventListener("touchmove", draw);
		canvas.removeEventListener("mouseup", stopDrawing);
		canvas.removeEventListener("touchend", stopDrawing);
		canvas.removeEventListener("mouseout", stopDrawing);
		canvas.removeEventListener("touchcancel", stopDrawing);
		canvas.removeEventListener("mouseleave", stopDrawing);
	});
}
/* style="width: 100%; border: 1px solid black; display: block;" */
