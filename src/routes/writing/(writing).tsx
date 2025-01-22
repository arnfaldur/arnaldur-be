import { For } from "solid-js";
import { A } from "@solidjs/router";

const unfilteredPosts: {
    [postName: string]: {
        title?: string,
        date?: Date,
        topic?: string[],
        hidden?: boolean,
    },
} = import.meta.glob("./about/**/(*).{md,mdx}", {
    eager: true,
});

// const posts = unfilteredPosts;
const posts = Object.fromEntries(
    Object.entries(unfilteredPosts).filter(
        ([_, frontmatter]) => !frontmatter?.hidden && frontmatter?.title
    )
);

const entries = Object.fromEntries(
    Object.entries(posts).map(([post, frontmatter]) => [
        "/writing" + post.slice(1).replace(/\/\(.*\)\.mdx/, ""),
        {
            title: frontmatter?.title ?? "Missing Title",
            date: frontmatter?.date ?? new Date(),
            topic: frontmatter?.topic ?? [],
        },
    ])
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
