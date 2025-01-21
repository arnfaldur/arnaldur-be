import { For } from "solid-js";
import { A } from "@solidjs/router";

const unfilteredPosts: {
    component: any,
    frontmatter: { title: string, date: string, hidden?: boolean },
} = import.meta.glob("./about/**/(*).{md,mdx}", { eager: true });

const posts = Object.fromEntries(
    Object.entries(unfilteredPosts).filter(
        ([post, { frontmatter }]) => !frontmatter?.hidden && frontmatter?.title
    )
);

const entries: {
    [t: string]: { title: string, date: Date, hidden?: boolean },
} = Object.fromEntries(
    Object.entries(posts).map(
        ([post, { frontmatter }]): [string, { title: string, date: Date }] => [
            "/writing" + post.slice(1).replace(/\/\(.*\)\.mdx/, ""),
            {
                title: frontmatter.title,
                ...(frontmatter?.date && { date: new Date(frontmatter.date) }),
            },
        ]
    )
);

export default function Writing() {
    const postList = Object.entries(entries).sort(
        (a, b) => b[1].date.valueOf() - a[1].date.valueOf()
    );
    return (
        <For each={postList}>
            {([url, post]) => (
                <article>
                    <A href={url}>
                        <h2>{post.title}</h2>
                    </A>
                    <small>
                        {post.date.toLocaleDateString("en-GB", {
                            dateStyle: "medium",
                        })}
                    </small>
                </article>
            )}
        </For>
    );
}
