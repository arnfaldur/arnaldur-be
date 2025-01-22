import { Suspense } from "solid-js";
import { PostList } from "../postList";

export default function About() {
    return (
        <Suspense>
            <PostList />
        </Suspense>
    );
}
