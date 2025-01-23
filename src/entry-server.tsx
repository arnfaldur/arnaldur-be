import { StartServer, createHandler } from "@solidjs/start/server";

const favicon =
    "data:image/svg+xml," +
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
    "<text y='77.5px' font-size='90'>🆎</text>" +
    "</svg>";

const Head = () => (
    <>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="darkreader-lock" />
        <link rel="icon" href={favicon} />
        <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css"
            type="text/css"
            integrity="sha384-zh0CIslj+VczCZtlzBcjt5ppRcsAmDnRem7ESsYwWwg3m/OaJ2l4x7YBZl9Kxxib"
            crossorigin="anonymous"
        />
    </>
);

export default createHandler(
    () => (
        <StartServer
            document={({ assets, children, scripts }) => (
                <html lang="en">
                    <head>
                        <Head />
                        {assets}
                    </head>
                    <body>
                        <div id="app">{children}</div>
                        {scripts}
                    </body>
                </html>
            )}
        />
    ),
    {
        mode: "async",
    }
);
