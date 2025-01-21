import { createSignal, Show } from "solid-js";

export default function DeferredYoutube(props: any) {
    const [isOpen, setIsOpen] = createSignal(false);

    const Placeholder = (
        <div
            onClick={() => setIsOpen(true)}
            style={{
                cursor: "pointer",
                display: "flex",
                "max-width": "100%",
                "padding-bottom": "6.5px",
                "align-items": "center",
                "justify-content": "center",
                "background-color": "black",
                color: "white",
                "border-radius": "8px",
            }}
        >
            <span style={{ "font-size": "1.5em" }}>
              {props.placeholder ?? "Click here to load youtube video"}
            </span>
        </div>
    );

    return (
        <>
            <Show when={isOpen()} fallback={Placeholder}>
                <iframe
                    src={props.yturl}
                    title="YouTube video player"
                    allow="clipboard-write; encrypted-media; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                />
            </Show>
        </>
    );
}
