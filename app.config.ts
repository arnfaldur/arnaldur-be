import { defineConfig } from "@solidjs/start/config";

import mdx from "@vinxi/plugin-mdx";

import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkMath from "remark-math";
import remarkEmbedder from "@remark-embedder/core";
import remarkSmartypants from "remark-smartypants";
import oEmbedTransformer from "@remark-embedder/transformer-oembed";
import embedderCache from "@remark-embedder/cache";
import rehypeMdxImportMedia from "rehype-mdx-import-media";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// TODO: consider remark-smartypants

export default defineConfig({
  extensions: ["tsx", "mdx", "md"],
  server: {
    preset: "aws-amplify",
  },
  vite: {
    plugins: [
      mdx.default.withImports({})({
        jsx: true,
        jsxImportSource: "solid-js",
        providerImportSource: "solid-mdx",
        remarkPlugins: [
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
          remarkFrontmatter,
          remarkMdxFrontmatter,
          remarkMath,
        ],
        rehypePlugins: [
          rehypeMdxImportMedia,
          rehypeKatex,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            { properties: { class: "autolink-heading" }, behavior: "wrap" },
          ],
        ],
        stylePropertyNameCase: "css",
        elementAttributeNameCase: "html",
        enforce: "pre",
      }),
    ],
  },
});
