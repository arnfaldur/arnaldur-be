import { For } from "solid-js";
import { A } from "@solidjs/router";
import { createResource } from "solid-js";
import { FileRoutes } from "@solidjs/start/router";

type Frontmatter = {
    title?: string;
    date?: Date;
    topic?: string[];
    hidden?: boolean;
    hn?: Hn;
};
type Post = {
    title: string;
    date: Date;
    topic: string[];
    hn?: Hn;
};
type Hn = {
    url: string;
    points: number;
};

type RouteData = {
    sitemapped?: boolean;
};

async function processRoutes(
    rawRoutes: Record<string, () => Promise<RouteData>>
) {
    const thing = Object.entries(rawRoutes).map<Promise<[string, RouteData]>>(
        async ([s, p]) => [s, await p()]
    );
    const thong = await Promise.all(thing);
    /* const rawRoutes = [] */

    const sitemappedRoutes = thong.filter(
        ([route, data]) => data?.sitemapped !== false
    );

    const cleanedRoutes = sitemappedRoutes.map(([route]) =>
        route.replace(/\/\(.*\)\//, "/")
    );
    /* console.log("cleanedRoutes", cleanedRoutes); */
    const filteredRoutes = cleanedRoutes.filter(
        (route) =>
            route.match("\\(.*\\).((mdx)|(tsx))$") &&
            !route.startsWith("/src/routes/wip") &&
            !route.startsWith("/src/routes/laughing") &&
            route !== "/src/routes/writing"
    );
    /* console.log("filteredRoutes ", filteredRoutes); */
    const routes = filteredRoutes.map((route) =>
        route.replace("/src/routes", "").replace(/\/\(.*\).(mdx|tsx)$/, "")
    );
    return routes;
}

export default function Page() {
    const imported = import.meta.glob<RouteData>("~/routes/**/(*).{mdx,tsx}", {
        eager: false,
    });
    console.log("imported", imported["/src/routes/(articles).tsx"]());

    const [routes] = createResource(() => processRoutes(imported));
    console.log("routes", routes);
    return <For each={routes()}>{Route}</For>;
}

const Route = (route) => (
    <article>
        <A href={route}>
            <h2 style={{ "font-size": "1.3rem" }}>{route}</h2>
        </A>
    </article>
);
