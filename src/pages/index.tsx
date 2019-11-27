import React from "react"
import {Link, graphql} from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import {rhythm} from "../utils/typography"

class BlogIndex extends React.Component {
    render() {
        const {data} = this.props;
        const siteTitle = data.site.siteMetadata.title;
        const posts = data.allFile.edges;

        return (
            <Layout location={this.props.location} title={siteTitle}>
                <SEO title="blogging"/>
                <Bio/>
                {posts.map(({node}) => {
                    const post = node.childMarkdownRemark;
                    const title = post.frontmatter.title || post.fields.slug;
                    return (
                        <article key={post.fields.slug}>
                            <header>
                                <h3 style={{marginBottom: rhythm(1 / 4),}} >
                                    <Link to={post.fields.slug}>
                                        {title}
                                    </Link>
                                </h3>
                                <small>{post.frontmatter.date}</small>
                            </header>
                            <section>
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: post.frontmatter.description || post.excerpt,
                                    }}
                                />
                            </section>
                            <hr style={{marginBottom: `1rem`}}/>
                        </article>
                    )
                })}
            </Layout>
        );
    }
}

export default BlogIndex

export const pageQuery = graphql`
    query {
        site {
            siteMetadata {
                title
            }
        }
        allFile(filter: {sourceInstanceName: {eq: "blog"}}, sort: {fields: childMarkdownRemark___frontmatter___date}) {
            edges {
                node {
                    childMarkdownRemark {
                        excerpt
                        frontmatter {
                            date(formatString: "MMMM DD, YYYY")
                            title
                            description
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
