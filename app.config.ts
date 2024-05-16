import { defineConfig } from "@solidjs/start/config";

import pkg from "@vinxi/plugin-mdx";
const { default: mdx } = pkg;

import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkMath from "remark-math";
import rehypeMdxImportMedia from "rehype-mdx-import-media";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// TODO: consider remark-smartypants

export default defineConfig({
  extensions: ["tsx", "mdx", "md"],
  server: {
    preset: "aws-amplify",
    // prerender: {
    //   crawlLinks: true,
    // },
  },
  vite: {
    plugins: [
      mdx.withImports({})({
        jsx: true,
        jsxImportSource: "solid-js",
        providerImportSource: "solid-mdx",
        remarkPlugins: [
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
// export default defineConfig({
//   base: "/",
//   plugins: [
//     {
//       ...mdx({
//         jsxImportSource: "solid-jsx",
//         remarkPlugins: [
//           remarkGfm,
//           remarkFrontmatter,
//           remarkMdxFrontmatter,
//           remarkMath,
//         ],
//         rehypePlugins: [
//           rehypeMdxImportMedia,
//           rehypeKatex,
//           rehypeSlug,
//           [rehypeAutolinkHeadings, { behavior: "wrap" }],
//         ],
//         stylePropertyNameCase: "css",
//         elementAttributeNameCase: "html",
//       }),
//       enforce: "pre",
//     },

//     solid({ adapter: staticAdapter(), extensions: [".mdx", ".md"] }),
//   ],
// });
