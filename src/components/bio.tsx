/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import { rhythm } from "../utils/typography"

const Bio = () => {
    const data = useStaticQuery(graphql`
        query BioQuery {
            avatar: file(absolutePath: { regex: "/arnaldur.jpg/" }) {
                childImageSharp {
                    fixed(width: 100, height: 100) {
                        ...GatsbyImageSharpFixed
                    }
                }
            }
            site {
                siteMetadata {
                    social {
                        twitter
                    }
                }
            }
        }
    `);

    const { social } = data.site.siteMetadata;
    return (
        <div
            style={{
                display: `flex`,
                marginBottom: rhythm(2.5),
            }}
        >
            <p>
                Here are some things that I found interesting enough to write about:
            </p>
        </div>
    )
};

export default Bio
