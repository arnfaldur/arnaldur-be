/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		if (!["production", "staging", "test"].includes(input?.stage)) {
			throw new Error(
				'invalid stage, only "production" and "staging" are allowed',
			);
		}
		return {
			name: "arnaldur-be",
			removal: input?.stage === "production" ? "remove" : "remove",
			home: "aws",
		};
	},
	async run() {
		if (!["production", "staging", "test"].includes($app.stage)) {
			throw new Error(
				'invalid stage, only "production" and "staging" are allowed',
			);
		}
		new sst.aws.StaticSite("arnaldur-be", {
			domain: $app.stage === "production"
				? {
					name: "arnaldur.be",
					redirects: ["www.arnaldur.be"],
				}
				: $app.stage === "staging"
				? {
					name: `staging.arnaldur.be`,
				}
				: {
					name: `test.arnaldur.be`,
				},
			build: {
				command: "pnpm build",
				output: ".output/public",
			},
		});
	},
});

// export default $config({
//     app(input) {
//         return {
//             name: "arnaldur-be",
//             removal: "retain",
//             home: "aws",
//         };
//     },
//     async run() {
//         new sst.aws.StaticSite("arnaldur-be", {
//             domain: {
//                 name: "arnaldur.be",
//                 redirects: ["www.arnaldur.be"],
//             },
//             build: {
//                 command: "pnpm build",
//                 output: ".output/public",
//             },
//         });
//     },
// });
