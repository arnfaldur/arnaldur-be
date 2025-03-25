import { defineConfig } from "@solidjs/start/config";

// @ts-ignore
import mdxCjs from "@vinxi/plugin-mdx";
const { default: mdx } = mdxCjs;

// import mdx from "@mdx-js/rollup";

import Inspect from "vite-plugin-inspect";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkEmbedder from "@remark-embedder/core";
import oEmbedTransformer from "@remark-embedder/transformer-oembed";
import embedderCache from "@remark-embedder/cache";
import remarkSmartypants from "remark-smartypants";
// @ts-ignore
import rehypeMdxImportMedia from "rehype-mdx-import-media";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { visit } from "unist-util-visit";

const remarkPlugins = [
    [remarkSmartypants, { dashes: "oldschool" }],
    [
        // @ts-ignore
        remarkEmbedder.default,
        {
            embedderCache,
            transformers: [
                // @ts-ignore
                oEmbedTransformer.default,
                // { params: { theme: "dark", dnt: true } },
            ],
        },
    ],
    remarkGfm,
    remarkMath,
];
const rehypePlugins = [
    rehypeSlug,
    [
        rehypeAutolinkHeadings,
        { properties: { class: "autolink-heading" }, behavior: "wrap" },
    ],
    rehypeKatex,
    rehypeMdxImportMedia,
    rehypeZoomableImg,
];

const server = {
    prerender: {
        autoSubfolderIndex: false,
        concurrency: 4,
        failOnError: true,
        routes: ["/", "/laughing"],
        crawlLinks: true,
    },
};

export default defineConfig({
    extensions: ["mdx", "md"],
    devOverlay: true,
    server,
    vite: {
        build: {
            rollupOptions: {
                external: [
                    "three",
                    // "katex"
                ],
                output: [
                    {
                        format: "es",
                        paths: {
                            three: "https://cdn.jsdelivr.net/npm/three@0.172.0/+esm",
                        },
                    },
                    // I can't figure out how to make katex work from a CDN
                    // {
                    //     format: "cjs",
                    //     paths: {
                    //         // katex: "https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.js",
                    //         katex: "https://cdn.jsdelivr.net/npm/katex@0.16.21/+esm",
                    //     },
                    // },
                ],
            },
        },
        plugins: [
            mdx.withImports({})({
                jsxImportSource: "solid-jsx",
                remarkPlugins,
                rehypePlugins,
                stylePropertyNameCase: "css",
                elementAttributeNameCase: "html",
                enforce: "pre",
            }),
            // {
            //     ...mdx({
            //         jsxImportSource: "solid-jsx",
            //         remarkPlugins,
            //         rehypePlugins,
            //         stylePropertyNameCase: "css",
            //         elementAttributeNameCase: "html",
            //     }),
            //     enforce: "pre",
            // },
            Inspect({
                build: true,
                outputDir: ".output/vite-inspect",
                embedded: true,
            }),
        ],
    },
});

function rehypeZoomableImg() {
    const imgReplacement = "ZoomableImg";
    return function (tree: any) {
        tree.children.unshift({
            type: "mdxjsEsm",
            value: "",
            data: {
                estree: {
                    type: "Program",
                    sourceType: "module",
                    body: [
                        {
                            type: "ImportDeclaration",
                            source: {
                                type: "Literal",
                                value: "~/components/ZoomableImg",
                            },
                            specifiers: [
                                {
                                    type: "ImportDefaultSpecifier",
                                    local: {
                                        type: "Identifier",
                                        name: imgReplacement,
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        });
        visit(tree, function (node) {
            // TODO: downgrade this to second ugliest hack ever
            if (node.name === "img") {
                node.name = "ZoomableImg";
            }
        });
    };
}
