
import Title from "~/components/Title";
import Header from "~/components/Header";

export default function WritingLayout(props) {
  return (
    <>
      <Title />
      <Header />
      <main>{props.children}</main>
    </>
  );
}
