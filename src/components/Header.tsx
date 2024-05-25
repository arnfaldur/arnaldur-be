import { createMemo, For, JSX } from "solid-js";
import { A, useLocation } from "@solidjs/router";

export default function Header(props: { children?: JSX.ArrayElement }) {
  const location = useLocation();

  // construct each url of the breadcrumb and it's least significant slug
  const partUrls = createMemo(() =>
    location.pathname
      .split("/")
      .slice(1)
      .reduce(
        (prev: Array<{ part: string, url: string }>, cur, i) =>
          prev.concat({
            part: cur,
            url: (i > 0 ? prev[i - 1].url : "") + "/" + cur,
          }),
        [],
      ),
  );
  return (
    <>
      <header>
        <h1 id="breadcrumb">
          <A href="/">Arnaldur</A>
          <span style={{ opacity: "0.75" }}>.</span>
          <A href="/explaining-the-url">be</A>
          <For each={partUrls()}>
            {(part) => (
              <>
                <span>/</span>
                <A href={part.url}>{part.part}</A>
              </>
            )}
          </For>
        </h1>
        {props.children}
      </header>
    </>
  );
}
