import { Suspense } from "solid-js";
import { createResource, For } from "solid-js";
import { A } from "@solidjs/router";

type Frontmatter = {
    title?: string;
    date?: Date;
    topic?: string[];
    hidden?: boolean;
};
const unfilteredPosts = import.meta.glob<Frontmatter>("./**/(*).{md,mdx,tsx}", {
    eager: false,
});

async function filterTransformPosts(
    unfilteredPosts: Record<string, () => Promise<Frontmatter>>
) {
    console.log("soidfj", process.env.NODE_ENV);
    const unfilteredPostEntries = Object.entries(unfilteredPosts);
    const promises = unfilteredPostEntries.map<Promise<[string, Frontmatter]>>(
        async ([s, p]) => [s, await p()]
    );
    const postEntries = await Promise.all(promises);

    const transformedPosts = postEntries.map<
        [string, { title: string; date: Date; topic: string[] }]
    >(([post, frontmatter]) => {
        const boi = post.slice(1).replace(/\/\(.*\)\.mdx/, "");
        return [
            "/wip" + boi,
            {
                title: frontmatter?.title ?? boi.slice(1),
                date: frontmatter?.date ?? new Date(),
                topic: frontmatter?.topic ?? [],
            },
        ];
    });
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

export default function Wip() {
    return (
        <Suspense>
            <PostList />
        </Suspense>
    );
}
