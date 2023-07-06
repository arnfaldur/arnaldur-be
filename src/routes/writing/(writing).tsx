import { For, Show, useContext } from "solid-js";
import { A } from "solid-start";
import { PostsContext } from "../writing";

export default function Writing() {
  const context = useContext(PostsContext);
  const postList = Object.entries(context);
  return (
    <For each={postList}>
      {([url, post], i) =>
        <article>
          <A href={url}>
            <h3>{post.title}</h3>
          </A>
          <small>{post.date}</small>
          <Show when={i() + 1 < postList.length}>
            <hr style="margin: 1em 0;" />
          </Show>
        </article>
      }
    </For>
  );
}
