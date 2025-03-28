import { splitProps } from "solid-js";
import { JSX, JSXElement, Setter } from "solid-js";

export const Checkbox = (props: {
	setValue: Setter<boolean>;
	children: JSXElement;
	ref?: Setter<HTMLInputElement>;
}) => (
	<label
		style={{
			width: "100%",
			margin: "0 auto 0.75rem auto",
		}}
	>
		<input
			ref={(el) => {
				props.setValue(el.checked);
				if (props.ref) {
					props.ref(el);
				}
			}}
			type="checkbox"
			onInput={(e) => props.setValue(e.target.checked)}
		/>
		{props.children}
	</label>
);

interface SliderProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
	setValue: Setter<number>;
	value?: number;
	ref?: Setter<HTMLInputElement>;
}

export const Slider = (props: SliderProps) => {
	const [custom, rest] = splitProps(props, ["setValue", "value", "ref"]);
	return (
		<input
			ref={(el) => {
				custom.setValue(Number(el.value));
				if (custom.ref) custom.ref(el);
			}}
			type="range"
			value={custom.value ?? 0}
			max={1}
			step="any"
			onInput={(e) => custom.setValue(Number(e.target.value))}
			style={{
				width: "100%",
				margin: "0 auto 0.75rem auto",
			}}
			{...rest}
		/>
	);
};
