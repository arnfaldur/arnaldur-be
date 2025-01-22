import type { JSX, ParentProps } from "solid-js";

import Title from "~/components/Title";
import Breadcrumb from "~/components/Breadcrumb";

export default function WritingLayout(props: ParentProps): JSX.Element {
    return (
        <>
            <Title />
            <header>
                <Breadcrumb />
            </header>
            <main class="writing">{props.children}</main>
            <footer>
                <Breadcrumb />
            </footer>
        </>
    );
}
