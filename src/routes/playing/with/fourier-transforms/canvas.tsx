import { Accessor, createEffect, createMemo, createSignal, onCleanup, Setter } from "solid-js";

import { rgbToCss, turboColormapSample } from "~/utils/colormap";
import { Point } from "./Point";
import { fft, gifft, shuffleArray } from "./fourier-transforms";
import { Slider } from "./components";
import * as drawings from "./drawings";
import {
	DrawingsFieldset,
	MiscFieldset,
	OpacityFieldset,
	type Ordering,
	OrderingFieldset,
} from "./fieldsets";

export function DrawingCanvas() {
	const strokeStyle = "white";
	const lineWidth = 2;

	const [points, setPoints] = createSignal<Point[]>(drawings.spiral(Math.pow(2, 8)));
	const [rotation, setRotation] = createSignal(0);
	const [pointOrdering, setPointOrdering] = createSignal<Ordering>("alternating");
	const [pointOrderingReversed, setPointOrderingReversed] = createSignal<boolean>(false);
	const [connectEnds, setConnectEnds] = createSignal<boolean>(false);
	const [drawingParameter, setDrawingParameter] = createSignal(128);

	const [focusedElement, setFocusedElement] = createSignal(0);

	const [unscaledRotationRate, setUnscaledRotationRate] = createSignal(0.5);
	const rotationRate = createMemo(
		() => Math.pow(2, unscaledRotationRate() * 12 - 14) - Math.pow(2, -14),
	);

	const [rawZoom, setRawZoom] = createSignal(0.25);
	const zoom = createMemo(() => Math.pow(2, rawZoom() * 12 - 3));

	const [drawingOpacity, setDrawingOpacity] = createSignal(1);
	const [dftOpacity, setDftOpacity] = createSignal(1);
	const [trailOpacity, setTrailOpacity] = createSignal(0.25);
	const [trailLength, setTrailLength] = createSignal(0.1);

	const visiblePoints = createMemo(() => points().filter((point) => point.visible));

	const pointsIft = createMemo(() =>
		gifft(visiblePoints()).map<[Point, number]>((point, i) => [point, i])
	);
	const trail = createMemo(() => {
		const coeffs = pointsIft();
		const N = coeffs.length;
		if (N === 0) return [];
		const M = Math.pow(2, Math.ceil(Math.log2(8 * N)));
		const D: Point[] = Array.from({ length: M }, () => new Point(0, 0));
		for (let k = 0; k < N; k++) {
			if (k < N / 2) {
				D[k] = coeffs[k][0];
			} else {
				D[M - N + k] = coeffs[k][0];
			}
		}
		return fft(D);
	});
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
	const focusPoint = createMemo(() => {
		const acc = pointsIftAcc();
		const focus = focusedElement();
		return acc[Math.min(acc.length - 1, focus)][0];
	});

	const setupCanvas = (canvas: HTMLCanvasElement) => {
		const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
		if (!ctx) return null;

		attachDrawingLogic(canvas, points, setPoints);

		attachResizingLogic(canvas, ctx);

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

			const s = Math.min(canvas.width, canvas.height);
			const cw = canvas.width / s;
			const ch = canvas.height / s;
			ctx.clearRect(-cw, -ch, 2 * cw, 2 * ch);

			ctx.save();
			const z = zoom();
			ctx.scale(z, z);
			const fp = focusPoint();
			ctx.translate(-fp.x, -fp.y);
			ctx.lineWidth = lineWidth / (s * z);

			if (trailOpacity() > 0 && trailLength() > 0) {
				ctx.globalAlpha = trailOpacity();
				ctx.strokeStyle = strokeStyle;
				const trailPoints = trail();
				const M = trailPoints.length;
				if (M > 0) {
					const N = pointsIft().length;
					const at = (i: number) => trailPoints[((i % M) + M) % M];
					const headExact = ((rotation() % N) / N) * M;
					const headInt = Math.floor(headExact);
					const tailExact = headExact - trailLength() * M;
					const tailInt = Math.ceil(tailExact);
					const tailFrac = tailInt - tailExact;
					const acc = pointsIftAcc();
					const tip = acc[acc.length - 1][0];
					ctx.beginPath();
					ctx.moveTo(tip.x, tip.y);
					for (let i = headInt; i >= tailInt; i--) {
						const p = at(i);
						ctx.lineTo(p.x, p.y);
					}
					if (tailFrac > 0) {
						const a = at(tailInt);
						const b = at(tailInt - 1);
						ctx.lineTo(
							a.x + (b.x - a.x) * tailFrac,
							a.y + (b.y - a.y) * tailFrac,
						);
					}
					ctx.stroke();
				}
			}
			if (dftOpacity() > 0) {
				ctx.globalAlpha = dftOpacity();
				drawDft(ctx, pointsIftAcc);
			}
			if (drawingOpacity() > 0) {
				ctx.globalAlpha = drawingOpacity();
				ctx.strokeStyle = strokeStyle;
				drawPoints(ctx, points(), connectEnds());
			}
			ctx.globalAlpha = 1;
			ctx.restore();

			frameId = requestAnimationFrame(animationLoop);
		};
		const startLoop = () => {
			lastTime = performance.now();
			frameId = requestAnimationFrame(animationLoop);
		};
		const onBlur = () => cancelAnimationFrame(frameId);
		const onFocus = () => startLoop();
		window.addEventListener("blur", onBlur);
		window.addEventListener("focus", onFocus);
		startLoop();
		onCleanup(() => {
			cancelAnimationFrame(frameId);
			window.removeEventListener("blur", onBlur);
			window.removeEventListener("focus", onFocus);
		});
	};

	const undoPoint = (undos: number) => {
		setPoints(points().slice(0, -undos));
	};

	const [positionSlider, setPositionSlider] = createSignal({} as HTMLInputElement);
	createEffect(() => {
		const slider = positionSlider();
		if (slider && unscaledRotationRate() > 0) {
			slider.value = (rotation() / pointsIftSel().length).toString();
		}
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

	const [sidebarWidth, setSidebarWidth] = createSignal(400);

	const onGripPointerDown = (e: PointerEvent) => {
		const grip = e.currentTarget as HTMLElement;
		grip.setPointerCapture(e.pointerId);
		const offset = e.clientX - sidebarWidth();
		const onMove = (e: PointerEvent) => setSidebarWidth(Math.max(0, e.clientX - offset));
		const onUp = () => {
			grip.removeEventListener("pointermove", onMove);
			grip.removeEventListener("pointerup", onUp);
		};
		grip.addEventListener("pointermove", onMove);
		grip.addEventListener("pointerup", onUp);
	};

	return (
		<div id="fft-drawer">
			<aside class="left" style={{ width: `${sidebarWidth()}px` }}>
				<fieldset class="slider-grid">
					<legend>Animation</legend>
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
				<fieldset class="slider-grid">
					<legend>Camera</legend>
					Element
					<input
						type="range"
						value={0}
						max={1}
						step={1 / points().length}
						onInput={(e) => {
							setFocusedElement(
								Math.round(Number(e.target.value) * pointsIft().length),
							);
						}}
					/>
					Zoom
					<Slider value={0.25} setValue={setRawZoom} />
				</fieldset>
				<OpacityFieldset
					setDrawingOpacity={setDrawingOpacity}
					setDftOpacity={setDftOpacity}
					setTrailOpacity={setTrailOpacity}
				/>
				<OrderingFieldset
					setPointOrdering={setPointOrdering}
					setPointOrderingReversed={setPointOrderingReversed}
				/>
				<MiscFieldset
					setPoints={setPoints}
					setConnectEnds={setConnectEnds}
					setConnectEndsCheckbox={setConnectEndsCheckbox}
					setRawZoom={setRawZoom}
				>
					<span>
						Trail length
						<Slider value={1} setValue={setTrailLength} />
					</span>
					<button onClick={() => undoPoint(1)}>Undo</button>
					<button onClick={() => undoPoint(10)}>Undo 10</button>
				</MiscFieldset>
				<DrawingsFieldset
					setDrawingParameter={setDrawingParameter}
					setConnectEnds={setConnectEnds}
					setPoints={setPoints}
					drawingParameter={drawingParameter}
					setRawZoom={setRawZoom}
				/>
			</aside>
			<div onPointerDown={onGripPointerDown} />
			<canvas ref={setupCanvas} width="400" height="400" />
		</div>
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
		})
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

const dcColor = `color-mix(in lch, ${rgbToCss(turboColormapSample(0.1))}, ${
	rgbToCss(turboColormapSample(0.9))
})`;

let strokeStyleCache: string[] = [];

function getStrokeStyles(samples: number): string[] {
	if (samples === strokeStyleCache.length) return strokeStyleCache;
	strokeStyleCache = new Array(samples);
	for (let i = 0; i < samples; ++i) {
		strokeStyleCache[i] = rgbToCss(turboColormapSample((i / samples) * 0.8 + 0.1));
	}
	return strokeStyleCache;
}

function drawDft(ctx: CanvasRenderingContext2D, pointsSelected: Accessor<[Point, number][]>) {
	const points = pointsSelected();
	const samples = points.length;
	const styles = getStrokeStyles(samples);
	for (let i = 0; i < samples; ++i) {
		const idx = points[i][1];
		ctx.beginPath();

		if (i !== 0) {
			ctx.moveTo(points[i - 1][0].x, points[i - 1][0].y);
		}
		ctx.strokeStyle = idx === 0 ? dcColor : styles[idx];
		ctx.lineTo(points[i][0].x, points[i][0].y);
		ctx.stroke();
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
		const s = Math.min(rect.width, rect.height) / 2;
		const x = (event.clientX - rect.left - rect.width / 2) / s;
		const y = -(event.clientY - rect.top - rect.height / 2) / s;
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

function applyCanvasTransform(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	const s = Math.min(canvas.width, canvas.height) / 2;
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.scale(s, -s);
}

function attachResizingLogic(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
	const resizeCanvas = () => {
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;

		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
			applyCanvasTransform(canvas, ctx);
		}
	};

	const observer = new ResizeObserver(resizeCanvas);
	observer.observe(canvas);
	onCleanup(() => observer.disconnect());

	resizeCanvas();
}
