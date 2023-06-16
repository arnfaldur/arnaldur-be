import { For, Show } from "solid-js";
import { A, FileRoutes } from "solid-start";

import Header from "~/components/Header";

const posts = import.meta.glob<{ frontmatter: { title: string, date: string } }>("./about/**/*.{md,mdx}", { eager: true });

export default function Writing() {
  let postList = [];
  for (const prop in posts) {
    postList.push({
      url: prop.substring(0, prop.lastIndexOf("/")),
      title: posts[prop].frontmatter.title,
      date: new Date(posts[prop].frontmatter.date).toLocaleDateString("en-GB", { dateStyle: "medium" }),
    });
  }
  console.log(postList);
  console.log(<FileRoutes />);
  return (
    <div style={{ "max-width": "40rem", "margin": "auto" }}>
      <Header />
      <main>
        <For each={postList}>
          {(post, i) =>
            <article>
              <A href={post.url}>
                <h3>{post.title}</h3>
              </A>
              <small>{post.date}</small>
              <Show when={i() + 1 < postList.length}>
                <hr style="margin: 1em 0;" />
              </Show>
            </article>
          }
        </For>
      </main>
    </div>
  );
}
