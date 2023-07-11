import { For, Show, useContext } from "solid-js";
import { A } from "solid-start";
import { PostsContext } from "../writing";

export default function Writing() {
  const context = useContext(PostsContext);
  const postList = Object.entries(context)
    .sort((a, b) => b[1].date.valueOf() - a[1].date.valueOf());
  return (
    <For each={postList}>
      {([url, post], i) =>
        <article>
          <A href={url}>
            <h3>{post.title}</h3>
          </A>
          <small>{post.date.toLocaleDateString("en-GB", { dateStyle: "medium" })}</small>
          <Show when={i() + 1 < postList.length}>
            <hr style="margin: 1em 0;" />
          </Show>
        </article>
      }
    </For>
  );
}
