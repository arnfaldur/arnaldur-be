// @refresh reload
import { Suspense } from "solid-js";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

import "./fonts.css";
// import "katex/dist/katex.min.css";
import "./matcha.css";
import "./adjustments.css";
// import "./columns.css";
// import "./app.css";

export default function App() {
    const routes = FileRoutes();
    const filteredRoutes = filterRoutes(routes);
    return (
        <Router
            root={(props) => (
                <MetaProvider>
                    <Suspense>{props.children}</Suspense>
                </MetaProvider>
            )}
        >
            {filteredRoutes}
        </Router>
    );
}

function filterRoutes(routes, path = "") {
    // the last slash matches subcomponents of articles. They shouldn't be made into pages.
    // As long as modules don't have default exports, they aren't rendered as pages.
    // const writingRegex = new RegExp("/writing/about/.*/");
    return routes
        .filter((route: any) => {
            const subpath: string = path + route.path;
            const remove =
                // writingRegex.test(subpath) ||
                (import.meta.env.PROD && subpath.startsWith("/wip"));
            return !remove;
        })
        .map((route: any) => ({
            ...route,
            children: route.children
                ? filterRoutes(route.children, path + route.path)
                : undefined,
        }));
}

function printRoutes(routes, path = "") {
    for (const route of routes) {
        const subpath: string = path + route.path;
        console.log("subpath", subpath);
        console.log("route", route);
        if (route.children) {
            printRoutes(route.children, subpath);
        }
    }
}
