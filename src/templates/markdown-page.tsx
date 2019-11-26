import React from "react"
import {Link, graphql} from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import {rhythm, scale} from "../utils/typography"

class MarkdownPageTemplate extends React.Component {
    render() {
        const post = this.props.data.markdownRemark;
        const siteTitle = this.props.data.site.siteMetadata.title;

        return (
            <Layout location={this.props.location} title={siteTitle}>
                <SEO
                    title={post.frontmatter.title}
                />
                <article>
                    <header>
                        <h1
                            style={{
                                marginTop: rhythm(1),
                                marginBottom: 0,
                            }}
                        >
                            {post.frontmatter.title}
                        </h1>
                    </header>
                    <p></p>
                    <section dangerouslySetInnerHTML={{__html: post.html}}/>
                    <hr
                        style={{
                            marginBottom: rhythm(1),
                        }}
                    />
                    <footer></footer>
                </article>
            </Layout>
        )
    }
}

export default MarkdownPageTemplate

export const pageQuery = graphql`
    query PageBySlug($slug: String!) {
        site {
            siteMetadata {
                title
            }
        }
        markdownRemark(fields: { slug: { eq: $slug } }) {
            id
            html
            frontmatter {
                title
            }
        }
    }
`
