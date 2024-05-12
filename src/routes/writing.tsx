import { createContext } from "solid-js";
import { Outlet } from "solid-start";

import Header from "~/components/Header";

const unfilteredPosts = import.meta.glob<{
  component: any,
  frontmatter: { title: string, date: string, hidden?: boolean },
}>("./writing/about/**/*.{md,mdx}", { eager: true });

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
      post.slice(1).replace(/\/\(.*\)\.mdx/, ""),
      {
        title: frontmatter.title,
        date: new Date(frontmatter.date),
      },
    ],
  ),
);
export const PostsContext = createContext(entries);

export default function WritingLayout() {
  return (
    <PostsContext.Provider value={entries}>
      <Header />
      <main>
        <Outlet />
      </main>
    </PostsContext.Provider>
  );
}
