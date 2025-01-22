import { Suspense } from "solid-js";
import { PostList } from "./postList";

export default function Writing() {
    return (
        <Suspense>
            <PostList />
        </Suspense>
    );
}
