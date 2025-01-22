import { createResource, For, Suspense } from "solid-js";
import { A } from "@solidjs/router";

type Frontmatter = {
    title?: string;
    date?: Date;
    topic?: string[];
    hidden?: boolean;
};
const unfilteredPosts = import.meta.glob<Frontmatter>(
    "./about/**/(*).{md,mdx}",
    { eager: false }
);

async function filterTransformPosts(
    unfilteredPosts: Record<string, () => Promise<Frontmatter>>
) {
    const unfilteredPostEntries = Object.entries(unfilteredPosts);
    const promises = unfilteredPostEntries.map<Promise<[string, Frontmatter]>>(
        async ([s, p]) => [s, await p()]
    );
    const postEntries = await Promise.all(promises);

    const filteredPosts = postEntries.filter(
        ([_, frontmatter]) => !frontmatter?.hidden && frontmatter?.title
    );
    const transformedPosts = filteredPosts.map<
        [string, { title: string; date: Date; topic: string[] }]
    >(([post, frontmatter]) => [
        "/writing" + post.slice(1).replace(/\/\(.*\)\.mdx/, ""),
        {
            title: frontmatter?.title ?? "Missing Title",
            date: frontmatter?.date ?? new Date(),
            topic: frontmatter?.topic ?? [],
        },
    ]);
    return transformedPosts.sort(
        (a, b) => b[1].date.valueOf() - a[1].date.valueOf()
    );
}

function PostList() {
    const [postList] = createResource(() =>
        filterTransformPosts(unfilteredPosts)
    );
    return (
        <For each={postList()}>
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

export default function Writing() {
    return (
        <Suspense>
            <PostList />
        </Suspense>
    );
}
