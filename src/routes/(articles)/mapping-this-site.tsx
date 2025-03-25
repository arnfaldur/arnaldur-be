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
    const cleanedRoutes = Object.entries(rawRoutes).map<
        [string, Promise<RouteData>]
    >(([route, contents]) => [route.replace(/\/\(.*\)\//, "/"), contents]);
    const filteredRoutes = cleanedRoutes.filter(
        ([route]) =>
            route.match("\\(.*\\).((mdx)|(tsx))$") &&
            !route.startsWith("/src/routes/wip") &&
            !route.startsWith("/src/routes/laughing") &&
            route !== "/src/routes/writing"
    );
    const formattedRoutes = filteredRoutes.map<[string, Promise<RouteData>]>(
        ([route, contents]) => [
            route.replace("/src/routes", "").replace(/\/\(.*\).(mdx|tsx)$/, ""),
            contents,
        ]
    );
    const uwrappedPromises = await Promise.all(
        formattedRoutes.map<Promise<[string, RouteData]>>(async ([s, p]) => [
            s,
            await p(),
        ])
    );

    const sitemappedRoutes = uwrappedPromises.filter(
        ([route, data]) => data?.sitemapped !== false
    );
    const routes = sitemappedRoutes.map(([route]) => route);

    return routes;
}

export default function Page() {
    /* const imported = []; */
    const imported = import.meta.glob<RouteData>("~/routes/**/(*).{mdx,tsx}", {
        eager: false,
    });

    const [routes] = createResource(() => processRoutes(imported));
    return <For each={routes()}>{Route}</For>;
}

const Route = (route: string) => (
    <article>
        <A href={route}>
            <h2 style={{ "font-size": "1.3rem" }}>{route}</h2>
        </A>
    </article>
);
