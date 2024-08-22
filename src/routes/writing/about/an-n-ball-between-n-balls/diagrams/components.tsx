import { clientOnly } from "@solidjs/start";
import { createSignal, batch } from "solid-js";

import { diagram3D2 } from "./diagram3D2";

// const green = "52753d";
// const red = "873839";
// const purple = "644475";
// const gray = "595959";
// const blue = "42538b";
// const cyan = "328486";
// const orange = "e09166";
// const brightYellow = "d9b55e";

export const Checkbox = (props) => (
    <label
        style={{
            scale: "1.25",
            width: "calc(100% / 1.25)",
            margin: "0 auto 0.75rem auto",
        }}
    >
        <input
            ref={(el) => props.setValue(el.checked)}
            type="checkbox"
            onInput={(e) => props.setValue(e.target.checked)}
        />
        {props.children}
    </label>
);

export const Slider = (props) => (
    <input
        ref={(el) => {
            props.setValue(el.value);
            if (props.ref) {
                props.ref(el);
            }
        }}
        type="range"
        value={0}
        max={1}
        step="any"
        onInput={(e) => props.setValue(e.target.value)}
        style={{
            scale: "1.5",
            width: "calc(100% / 1.5)",
            margin: "0 auto 0.75rem auto",
        }}
    />
);
