import Title from "~/components/Title";
import Breadcrumb from "~/components/Breadcrumb";

export default function ExplainingTheUrlLayout(props) {
  return (
    <>
      <Title />
      <Breadcrumb />
      <main>{props.children}</main>
    </>
  );
}
