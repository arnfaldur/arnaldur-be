import Title from "~/components/Title";
import Breadcrumb from "~/components/Breadcrumb";

export default function WipLayout(props) {
    return (
        <>
            <Title />
            <header>
                <Breadcrumb />
            </header>
            <main>{props.children}</main>
            <footer>
                <Breadcrumb />
            </footer>
        </>
    );
}
