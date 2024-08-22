import Title from "~/components/Title";
import Breadcrumb from "~/components/Breadcrumb";

export default function LaughingLayout(props) {
    return (
        <>
            <Title />
            <Breadcrumb />
            <main>{props.children}</main>
        </>
    );
}
