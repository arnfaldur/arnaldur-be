import { StartServer, createHandler } from "@solidjs/start/server";

export default createHandler(
    () => (
        <StartServer
            document={({ assets, children, scripts }) => (
                <html lang="en">
                    <head>
                        <meta charset="utf-8" />
                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1"
                        />
                        <meta name="darkreader-lock" />
                        <link
                            rel="icon"
                            href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22><text y=%32px%22 font-size=%2232%22>🆎</text></svg>"
                        />
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
