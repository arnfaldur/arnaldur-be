import { createMemo, For } from "solid-js";
import { Title, A, useLocation } from "solid-start";

export default function Header() {
  const location = useLocation();
  const url = createMemo(() => "Arnaldur.be" + location.pathname);

  const partUrls = createMemo(() =>
    location.pathname.split("/").slice(1).reduce((prev: Array<{ part: string, url: string }>, cur, i) =>
      prev.concat({ part: cur, url: (i > 0 ? prev[i - 1].url : "") + "/" + cur }),
      []))
  // style={{ "margin-bottom": "3em" }}
  return (
    <>
      <Title>{url()}</Title>
      {/* TODO: make the punctuation marks quieter visibly */}
      <header style={{ "margin-bottom": "3em" }}>
        <h1 >
          <A href="/">Arnaldur</A>.
          <A href="/explaining-the-url">be</A>
          <For each={partUrls()}>
            {(part) => (<>
              /<A href={part.url}>{part.part}</A>
            </>)}
          </For>
        </h1>
      </header>
    </>
  );
}
