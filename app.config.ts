import { defineConfig } from "@solidjs/start/config";

import mdx from "@vinxi/plugin-mdx";

import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkMath from "remark-math";
import remarkEmbedder from "@remark-embedder/core";
import oEmbedTransformer from "@remark-embedder/transformer-oembed";
import embedderCache from "@remark-embedder/cache";
import remarkSmartypants from "remark-smartypants";
import rehypeMdxImportMedia from "rehype-mdx-import-media";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { visit } from "unist-util-visit";

const remarkPlugins = [
    remarkFrontmatter,
    remarkMdxFrontmatter,
    [remarkSmartypants, { dashes: "oldschool" }],
    [
        remarkEmbedder.default,
        {
            embedderCache,
            transformers: [
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
    preset: "aws-amplify",
    // prerender: {
    //   routes: ["/", "/writing", "/laughing"],
    //   crawlLinks: true,
    // },
};

export default defineConfig({
    extensions: ["mdx", "md"],
    server,
    vite: {
        plugins: [
            mdx.default.withImports({})({
                jsxImportSource: "solid-jsx",
                remarkPlugins,
                rehypePlugins,
                stylePropertyNameCase: "css",
                elementAttributeNameCase: "html",
                enforce: "pre",
            }),
        ],
    },
});

function rehypeZoomableImg() {
    const imgReplacement = "ZoomableImg";
    return function (tree) {
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
