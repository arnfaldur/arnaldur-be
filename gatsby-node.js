const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);

pageInstances = name => {
    return `
            {
                allFile(
                    filter: {
                        base: {eq: "index.md"},
                        sourceInstanceName: {eq: "${name}"}
                    },
                    sort: {fields: childMarkdownRemark___frontmatter___date}
                ) {
                    edges {
                        node {
                            childMarkdownRemark {
                                frontmatter {
                                    title
                                }
                                fields {
                                    slug
                                }
                            }
                        }
                    }
                }
            }
        `;
};

exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions;

    const blogPost = path.resolve(`./src/templates/blog-post.tsx`);
    const blogQuery = await graphql(pageInstances("blog"));

    if (blogQuery.errors) {
        throw blogQuery.errors;
    }

    // Create blog posts pages.
    const posts = blogQuery.data.allFile.edges.map(edge => {
        return edge.node.childMarkdownRemark;
    }).filter(post => {
        return post !== null;
    });
    console.log(posts);
    posts.forEach((post, index) => {
        const previous =
            index === posts.length - 1 ? null : posts[index + 1].node;
        const next = index === 0 ? null : posts[index - 1].node;
        const newPath = post.fields.slug;
        createPage({
            path: newPath,
            component: blogPost,
            context: {
                slug: newPath,
                previous,
                next,
            },
        });
    });
    const MarkdownPage = path.resolve(`./src/templates/markdown-page.tsx`);
    const pageQuery = await graphql(pageInstances("pages"));
    if (pageQuery.errors) {
        throw pageQuery.errors;
    }
    const pages = pageQuery.data.allFile.edges.map(edge => {
        return edge.node.childMarkdownRemark;
    });
    console.log("pages: ");
    console.log(pages);
    pages.forEach(page => {
        const newPath = page.fields.slug;
        createPage({
            path: newPath,
            component: MarkdownPage,
            context: {
                slug: newPath,
            },
        });
    });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
    const { createNodeField } = actions;
    if (node.internal.type === `MarkdownRemark`) {
        let value = `${createFilePath({
            node,
            getNode,
        })}`;

        console.log("inserting\n" + value);
        if (getNode(node.parent).sourceInstanceName === "blog") {
            value = `/blogging/about` + value;
        }
        console.log(value);
        //
        createNodeField({
            node,
            name: `slug`,
            value,
        });
    }
};
