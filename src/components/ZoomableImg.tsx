import { Image } from "@unpic/solid";
import { createEffect, createSignal, Show } from "solid-js";

export default function ZoomableImg(props: any) {
    const [isOpen, setIsOpen] = createSignal(false);

    return (
        <>
            <Image
                src={props.src}
                alt={props.alt}
                onClick={() => setIsOpen(true)}
                style={{
                    cursor: "pointer",
                }}
            />
            <Show when={isOpen()}>
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        "background-color": "rgba(0, 0, 0, 0.8)",
                        display: "flex",
                        "justify-content": "center",
                        "align-items": "center",
                        "z-index": 1000,
                        cursor: "pointer",
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    <Image src={props.src} alt={props.alt} />
                </div>
            </Show>
        </>
    );
}
