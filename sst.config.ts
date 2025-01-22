/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "arnaldur-be",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },
    async run() {
        new sst.aws.StaticSite("arnaldur.be", {
            domain: {
                name: "staging.arnaldur.be",
                // redirects: ["www.arnaldur.be"]
            },
            build: {
                command: "pnpm build",
                output: ".output/public",
            },
        });
    },
});
