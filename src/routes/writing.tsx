
import Title from "~/components/Title";
import Breadcrumb from "~/components/Header";

export default function WritingLayout(props) {
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
