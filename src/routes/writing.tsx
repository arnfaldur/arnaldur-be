
import { createContext } from "solid-js";
import { Outlet } from "solid-start";

import Header from "~/components/Header";

const posts = import.meta.glob<{
  component: any, frontmatter: { title: string, date: string }
}>("./writing/about/**/*.{md,mdx}", { eager: true });

const entries: { [t: string]: { title: string, date: Date } } = Object
  .fromEntries(Object.entries(posts)
    .map(([post, { frontmatter }]): [string, { title: string; date: Date; }] => (
      [post.slice(1).replace(/\/\(.*\)\.mdx/, ""), {
        title: frontmatter.title,
        date: new Date(frontmatter.date),
      }]))
  );
export const PostsContext = createContext(entries);

export default function WritingLayout() {
  return (
    <PostsContext.Provider value={entries}>
      <Header />
      <main >
        <Outlet />
      </main>
    </PostsContext.Provider>
  );
}
