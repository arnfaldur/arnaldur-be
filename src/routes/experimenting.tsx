import Title from "~/components/Title";
import Breadcrumb from "~/components/Breadcrumb";

export default function ExperimentingLayout(props) {
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
