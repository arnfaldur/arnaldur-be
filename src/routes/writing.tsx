import Title from "~/components/Title";
import Breadcrumb from "~/components/Breadcrumb";

export default function WritingLayout(props) {
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
