import { createEffect, createMemo, For, Show, useContext } from "solid-js";
import { Title, A, useLocation } from "solid-start";
import { PostsContext } from "~/routes/writing";

export default function Header() {
  const location = useLocation();
  const context = useContext(PostsContext);
  const url = createMemo(() => "Arnaldur.be" + location.pathname);

  // construct each url of the breadcrumb and it's least significant slug
  const partUrls = createMemo(() =>
    location.pathname.split("/").slice(1).reduce((prev: Array<{ part: string, url: string }>, cur, i) =>
      prev.concat({ part: cur, url: (i > 0 ? prev[i - 1].url : "") + "/" + cur }),
      []))
  // style={{ "margin-bottom": "3em" }}
  // createEffect(() => console.log(partUrls()))
  return (
    <>
      <Title>{url()}</Title>
      {/* TODO: make the punctuation marks quieter visibly */}
      <header style={{ "max-width": "40rem", "margin": "auto", "margin-bottom": "2em" }}>
        <h1 >
          <A href="/">Arnaldur</A>.
          <A href="/explaining-the-url">be</A>
          <For each={partUrls()}>
            {(part) => (<span style="white-space: nowrap;">
              <span>/</span><A href={part.url}>{part.part}</A>
            </span>)}
          </For>
        </h1>
        <Show when={context[location.pathname]}>
          <p>
            {context[location.pathname].date}
          </p>
        </Show>
      </header>
    </>
  );
}
