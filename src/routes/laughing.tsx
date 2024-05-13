
import Title from "~/components/Title";
import Header from "~/components/Header";

export default function LaughingLayout(props) {
  return (
    <>
      <Title />
      <Header />
      <main>{props.children}</main>
    </>
  );
}
