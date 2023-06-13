import solid from "solid-start/vite";
import staticAdapter from "solid-start-static";
import { defineConfig } from "vite";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkMdxImages from "remark-mdx-images";

export default defineConfig({
  base: "/",
  plugins: [
    {
      ...(await import("@mdx-js/rollup")).default({
        jsx: true,
        jsxImportSource: "solid-js",
        providerImportSource: "solid-mdx",
        remarkPlugins: [remarkGfm, remarkMdxImages, remarkFrontmatter, remarkMdxFrontmatter],
      }),
      enforce: "pre",
    },
    solid({ adapter: staticAdapter(), extensions: [".mdx", ".md"] }),
  ],
});
