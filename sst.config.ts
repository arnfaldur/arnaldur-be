/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        if (!["production", "staging"].includes(input?.stage)) {
            throw new Error(
                'invalid stage, only "production" and "staging" are allowed'
            );
        }
        return {
            name: "arnaldur-be",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },
    async run() {
        if (!["production", "staging"].includes($app.stage)) {
            throw new Error(
                'invalid stage, only "production" and "staging" are allowed'
            );
        }
        new sst.aws.StaticSite("arnaldur.be", {
            domain:
                $app.stage === "production"
                    ? {
                          name: "arnaldur.be",
                          redirects: ["www.arnaldur.be"],
                      }
                    : {
                          name: `staging.arnaldur.be`,
                      },
            build: {
                command: "pnpm build",
                output: ".output/public",
            },
        });
    },
});
