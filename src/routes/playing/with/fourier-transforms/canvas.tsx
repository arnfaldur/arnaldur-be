import { Accessor, createEffect, createMemo, createSignal, onCleanup, Setter } from "solid-js";

import { rgbToCss, turboColormapSample } from "~/utils/colormap";
import { Point } from "./Point";
import { gifft, shuffleArray } from "./fourier-transforms";
import { Slider } from "./components";
import * as drawings from "./drawings";
import { DrawingsFieldset, OrderingFieldset, type Ordering } from "./fieldsets";

export function DrawingCanvas() {
	const relativeWidth = 0.99;
	const relativeHeight = 0.7;

	const strokeStyle = "white";
	const lineWidth = 2;

	const [points, setPoints] = createSignal<Point[]>([]);
	const [rotation, setRotation] = createSignal(0);
	const [pointOrdering, setPointOrdering] = createSignal<Ordering>("alternating");
	const [pointOrderingReversed, setPointOrderingReversed] = createSignal<boolean>(false);
	const [connectEnds, setConnectEnds] = createSignal<boolean>(false);
	const [drawingParameter, setDrawingParameter] = createSignal(128);

	const [focusedElement, setFocusedElement] = createSignal(0);
	const [focusPoint, setFocusPoint] = createSignal(new Point(0, 0));

	const [unscaledRotationRate, setUnscaledRotationRate] = createSignal(0.5);
	const rotationRate = createMemo(
		() => Math.pow(2, unscaledRotationRate() * 12 - 14) - Math.pow(2, -14),
	);

	const [rawZoom, setRawZoom] = createSignal(0.25);
	const zoom = createMemo(() => Math.pow(2, rawZoom() * 12 - 3));

	setPoints(drawings.spiral(Math.pow(2, 8)));
	setConnectEnds(true);

	const visiblePoints = createMemo(() => points().filter((point) => point.visible));

	const pointsIft = createMemo(() =>
		gifft(visiblePoints()).map<[Point, number]>((point, i) => [point, i]),
	);
	const pointsIftSel = createPointOrderings(pointsIft, pointOrdering, pointOrderingReversed);
	const pointsIftAcc = createMemo(() => {
		let acc = new Point(0, 0);
		let result: [Point, number][] = [];
		result.push([acc, -1]);
		const pointsFt = pointsIftSel();
		const samples = pointsFt.length;
		for (var i = 0; i < samples; ++i) {
			const [point, idx] = pointsFt[i];

			const shiftedIndex = idx >= samples / 2 ? idx - samples : idx;
			const rads = -((2 * Math.PI) / samples) * shiftedIndex * rotation();
			acc = acc.add(point.rotate(rads));
			result.push([acc, idx]);
		}
		return result;
	});
	createEffect(() => {
		const acc = pointsIftAcc();
		const focus = focusedElement();
		setFocusPoint(focus < acc.length ? acc[focus][0] : new Point(0, 0));
	});
	const pointsTransformed = createMemo(() =>
		points().map((p) => p.sub(focusPoint()).scale(zoom())),
	);
	const pointsIftTransformed = createMemo(() =>
		pointsIftAcc().map<[Point, number]>(([p, i]) => [p.sub(focusPoint()).scale(zoom()), i]),
	);

	const setupCanvas = (canvas: HTMLCanvasElement) => {
		const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
		if (!ctx) return null;

		const reScale = window?.devicePixelRatio ?? 1;
		// Scale the canvas to fit the desired coordinate system
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.scale((canvas.width / 2) * reScale, (-canvas.height / 2) * reScale);

		attachDrawingLogic(canvas, points, setPoints);

		attachResizingLogic(relativeWidth, relativeHeight, canvas, ctx);

		let lastTime = performance.now();
		let frameId: number;
		const animationLoop = (timestamp: DOMHighResTimeStamp) => {
			const deltaTime = timestamp - lastTime;
			lastTime = timestamp;
			setRotation((rotation) => rotation + deltaTime * rotationRate());
			if (pointsIftSel().length === 0) {
				setRotation(0);
			} else if (rotation() >= pointsIftSel().length) {
				setRotation((rotation) => rotation % pointsIftSel().length);
			}

			ctx.clearRect(-1, -1, 2, 2);

			ctx.lineWidth = lineWidth / (ctx.canvas.height ?? 400);
			drawDft(ctx, pointsIftTransformed);
			ctx.strokeStyle = strokeStyle;
			drawPoints(ctx, pointsTransformed(), connectEnds());

			frameId = requestAnimationFrame(animationLoop);
		};
		frameId = requestAnimationFrame(animationLoop);
		onCleanup(() => cancelAnimationFrame(frameId));
	};

	const undoPoint = (undos: number) => {
		setPoints(points().slice(0, -undos));
	};

	const [positionSlider, setPositionSlider] = createSignal({} as HTMLInputElement);
	createEffect(() => {
		const slider = positionSlider();
		if (slider && unscaledRotationRate() > 0)
			slider.value = (rotation() / pointsIftSel().length).toString();
	});

	const [animationSpeedSlider, setAnimationSpeedSlider] = createSignal({} as HTMLInputElement);
	createEffect(() => {
		const slider = animationSpeedSlider();
		if (slider) slider.value = unscaledRotationRate().toString();
	});

	const [connectEndsCheckbox, setConnectEndsCheckbox] = createSignal({} as HTMLInputElement);
	createEffect(() => {
		const checkbox = connectEndsCheckbox();
		if (checkbox) checkbox.checked = connectEnds();
	});

	return (
		<>
			<canvas
				ref={setupCanvas}
				width="400"
				height="400"
				style={{
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
						setRotation(Number(el.value) * pointsIftSel().length);
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
						setRotation(Number(v.target.value) * pointsIftSel().length);
					}}
				/>
				Speed
				<Slider
					ref={setAnimationSpeedSlider}
					value={0.5}
					setValue={setUnscaledRotationRate}
				/>
			</fieldset>
			<fieldset style={{ display: "grid", grid: "auto-flow dense / 0fr 1fr", gap: "0 1rem" }}>
				<legend>Camera</legend>
				Element
				<input
					type="range"
					value={0}
					max={1}
					step={1 / points().length}
					style={{
						width: "100%",
						margin: "0 auto 0.75rem auto",
					}}
					onInput={(e) => {
						setFocusedElement(Math.round(Number(e.target.value) * pointsIft().length));
					}}
				/>
				Zoom
				<Slider value={0.25} setValue={setRawZoom} />
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
				<DrawingsFieldset
					setDrawingParameter={setDrawingParameter}
					setConnectEnds={setConnectEnds}
					setPoints={setPoints}
					drawingParameter={drawingParameter}
					setRawZoom={setRawZoom}
				/>
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

function drawPoints(ctx: CanvasRenderingContext2D, points: Point[], connectEnds: boolean) {
	ctx.beginPath();
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

function drawDft(ctx: CanvasRenderingContext2D, pointsSelected: Accessor<[Point, number][]>) {
	ctx.strokeStyle = rgbToCss(turboColormapSample(0));
	const points = pointsSelected();
	for (let i = 0; i < points.length; ++i) {
		const idx = points[i][1];

		const samples = points.length;

		ctx.beginPath();

		if (i !== 0) {
			ctx.moveTo(points[i - 1][0].x, points[i - 1][0].y);
		}
		ctx.strokeStyle =
			idx === 0
				? `color-mix(in lch, ${rgbToCss(turboColormapSample(0.1))}, ${rgbToCss(
						turboColormapSample(0.9),
					)})`
				: rgbToCss(turboColormapSample((idx / samples) * 0.8 + 0.1));
		ctx.lineTo(points[i][0].x, points[i][0].y);
		ctx.stroke();
		ctx.closePath();
	}
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
		// first point needs an extra hidden point.
		setPoints([...points(), point.asHidden(), point.asVisible()]);
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

function attachResizingLogic(
	relativeWidth: number,
	relativeHeight: number,
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
) {
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
}
