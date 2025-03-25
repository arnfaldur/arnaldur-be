import { createResource, For } from "solid-js";
import { A } from "@solidjs/router";

import HNLogo from "./y18.svg";

type Frontmatter = {
    title?: string,
    date?: Date,
    topic?: string[],
    hidden?: boolean,
    hn?: Hn,
};
type Post = {
    title: string,
    date: Date,
    topic: string[],
    hn?: Hn,
};
type Hn = {
    url: string,
    points: number,
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
    const transformedPosts = filteredPosts.map<[string, Post]>(
        ([post, frontmatter]) => [
            "/writing" + post.slice(1).replace(/\/\(.*\)\.mdx/, ""),
            {
                title: frontmatter?.title ?? "Missing Title",
                date: frontmatter?.date ?? new Date(),
                topic: frontmatter?.topic ?? [],
                hn: frontmatter?.hn,
            },
        ]
    );
    return transformedPosts.sort(
        (a, b) => b[1].date.valueOf() - a[1].date.valueOf()
    );
}

export function PostList() {
    const [postList] = createResource(() =>
        filterTransformPosts(unfilteredPosts)
    );
    return <For each={postList()}>{PostComp}</For>;
}

const PostComp = ([url, post]: [string, Post]) => (
    <article>
        <A href={url}>
            <h2>{post.title}</h2>
        </A>
        <small style={{ display: "flex" }}>
            <span style={{ "flex-grow": "1" }}>
                {post.date.toLocaleDateString("en-GB", {
                    dateStyle: "medium",
                })}
            </span>
            <a href={post?.hn?.url} style={{ display: "flex" }}>
                <span>{post?.hn?.points} points @&nbsp;</span>
                <img
                    style={{ "flex-grow": "0", "border-radius": "0" }}
                    class="hacker-news"
                    src={HNLogo}
                />
            </a>
        </small>
    </article>
);
