import { For, JSXElement } from "solid-js";
import { Accessor, Setter } from "solid-js";

import { Point } from "./Point";
import { Checkbox } from "./components";
import * as drawings from "./drawings";

export type Ordering = "default" | "insideOut" | "alternating" | "bySize" | "byAngle" | "shuffled";

export const orderingData: { [key in Ordering]: string } = {
	default: "Default",
	insideOut: "Inside Out",
	alternating: "Alternating",
	bySize: "By Size",
	byAngle: "By Angle",
	shuffled: "Shuffled",
};

const drawingConfigs = [
	{ title: "Circle", drawing: drawings.circle, connectEnds: true },
	{ title: "Spiral", drawing: drawings.spiral, connectEnds: false },
	{ title: "Log Spiral", drawing: drawings.logSpiral, connectEnds: false },
	{ title: "Two Points", drawing: drawings.twoPoints, connectEnds: false },
	{ title: "Heart", drawing: drawings.heart, connectEnds: true },
	{ title: "Wave", drawing: drawings.wave, connectEnds: false },
	{ title: "S", drawing: drawings.s, connectEnds: true },
	{ title: "Infinity", drawing: drawings.infinity, connectEnds: true },
	{ title: "Infinity (Geometric)", drawing: drawings.infinityGeometric, connectEnds: true },
	{ title: "Hilbert", drawing: drawings.hilbert, connectEnds: false },
	{ title: "Moore", drawing: drawings.moore, connectEnds: true },
	{ title: "Random uniform", drawing: drawings.uniform, connectEnds: false },
	{ title: "Random gaussian", drawing: drawings.gaussian, connectEnds: false },
];

export function DrawingsFieldset({
	setDrawingParameter,
	setConnectEnds,
	setPoints,
	drawingParameter,
	setRawZoom,
}: {
	setDrawingParameter: Setter<number>;
	setConnectEnds: Setter<boolean>;
	setPoints: Setter<Point[]>;
	drawingParameter: Accessor<number>;
	setRawZoom: Setter<number>;
}) {
	return (
		<fieldset>
			<legend>Drawings</legend>
			<div style={{ display: "grid" }}>
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
				<For each={drawingConfigs}>
					{({ title, drawing, connectEnds }) => (
						<button
							onClick={() => {
								setConnectEnds(connectEnds);
								setPoints(drawing(drawingParameter()));
								setRawZoom(0.25);
							}}
						>
							{title}
						</button>
					)}
				</For>
			</div>
		</fieldset>
	);
}

export function MiscFieldset({
	setPoints,
	setConnectEnds,
	setConnectEndsCheckbox,
	setRawZoom,
	children,
}: {
	setPoints: Setter<Point[]>;
	setConnectEnds: Setter<boolean>;
	setConnectEndsCheckbox: Setter<HTMLInputElement>;
	setRawZoom: Setter<number>;
	children?: JSXElement;
}) {
	return (
		<fieldset>
			<legend>Misc</legend>
			<div
				style={{
					display: "grid",
					"grid-template-rows": "1fr 1fr 1fr",
				}}
			>
				{children}
				<button
					type="reset"
					onClick={() => {
						setPoints([]);
						setRawZoom(0.25);
					}}
				>
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
	);
}

export function OrderingFieldset({
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
					{([ordering, description]) => (
						<label>
							<input
								type="radio"
								name="ordering"
								value={ordering}
								onInput={(el) =>
									setPointOrdering((_previous) => el.target.value as Ordering)
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
