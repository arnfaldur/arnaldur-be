import { For, Show } from "solid-js";
import { A } from "@solidjs/router";

const unfilteredPosts: {
  component: any,
  frontmatter: { title: string, date: string, hidden?: boolean },
} = import.meta.glob("./about/**/*.{md,mdx}", { eager: true });

const posts = Object.fromEntries(
  Object.entries(unfilteredPosts).filter(
    ([post, { frontmatter }]) => !frontmatter?.hidden,
  ),
);

const entries: {
  [t: string]: { title: string, date: Date, hidden?: boolean },
} = Object.fromEntries(
  Object.entries(posts).map(
    ([post, { frontmatter }]): [string, { title: string, date: Date }] => [
      "/writing" + post.slice(1).replace(/\/\(.*\)\.mdx/, ""),
      {
        title: frontmatter.title,
        date: new Date(frontmatter.date),
      },
    ],
  ),
);

export default function Writing() {
  const postList = Object.entries(entries).sort(
    (a, b) => b[1].date.valueOf() - a[1].date.valueOf(),
  );
  return (
    <For each={postList}>
      {([url, post], i) => (
        <article>
          <A href={url}>
            <h2>{post.title}</h2>
          </A>
          <small>
            {post.date.toLocaleDateString("en-GB", {
              dateStyle: "medium",
            })}
          </small>
          <Show when={i() + 1 < postList.length}>
            <hr style="margin: 1em 0;" />
          </Show>
        </article>
      )}
    </For>
  );
}
