import { defineConfig } from "vite";

import mdx from "@mdx-js/rollup";
import solid from "solid-start/vite";
import staticAdapter from "solid-start-static";

import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkMdxImages from "remark-mdx-images";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// TODO: consider remark-smartypants

export default defineConfig({
  base: "/",
  plugins: [
    {
      ...mdx({
        jsxImportSource: "solid-jsx",
        remarkPlugins: [remarkGfm, remarkMdxImages, remarkFrontmatter, remarkMdxFrontmatter, remarkMath,],
        rehypePlugins: [rehypeKatex, rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }],],
        stylePropertyNameCase: "css",
        elementAttributeNameCase: "html",
      }),
      enforce: "pre",
    },

    solid({ adapter: staticAdapter(), extensions: [".mdx", ".md"] }),
  ],
});
