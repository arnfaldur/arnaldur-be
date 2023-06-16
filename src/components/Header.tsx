import { Title, A, useLocation } from "solid-start";

export default function Header() {
  const location = useLocation();
  const url = "Arnaldur.be" + location.pathname;

  console.log(location);
  // style={{ "margin-bottom": "3em" }}
  return (
    <>
      <Title>{url}</Title>
      <header style={{ "margin-bottom": "3em" }}>
        <h1 >
          <A href="/">Arnaldur</A>.
          <A href="/explaining-the-url">be</A>
          <A href={location.pathname}>{location.pathname}</A>
        </h1>
      </header>
    </>
  );
}
