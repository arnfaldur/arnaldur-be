import React from "react"
import { Link } from "gatsby"

import { rhythm } from "../utils/typography"

class Layout extends React.Component {
    render() {
        const { location, children } = this.props
        const rootPath = `${__PATH_PREFIX__}/`
        const styleOnThem = {
            /* boxShadow: `none`,
             * textDecoration: `none`,  */
            color: `inherit`,
        }
        let slug
        if (location.pathname === "/") {
            slug = (
                <div>
                    /
                    <Link style={styleOnThem} to={`/`}>
                        blogging
                    </Link>
                </div>
            )
        } else if (location.pathname.slice(0, 10) === "/blogging/") {
            slug = (
                <div>
                    /
                    <Link style={styleOnThem} to={`/`}>
                        blogging-about
                    </Link>
                    /
                    <Link style={styleOnThem} to={location.pathname}>
                        {location.pathname.slice(16, -1)}
                    </Link>
                    /
                </div>
            )
        } else {
            slug = (
                <div>
                    /
                    <Link style={styleOnThem} to={location.pathname.slice(1)}>
                        {location.pathname.slice(1, -1)}
                    </Link>
                    /
                </div>
            )
        }
        const header = (
            <h3
                style={{
                    fontFamily: `Montserrat, sans-serif`,
                    marginTop: 0,
                    fontWeight: 400,
                }}
            >
                <Link style={styleOnThem} to={`/`}>
                    Arnaldur
                </Link>
                .
                <Link style={styleOnThem} to={`/explaining-the-url/`}>
                    be
                </Link>
                {slug.props.children}
            </h3>
        )
        return (
            <div
                style={{
                    marginLeft: `auto`,
                    marginRight: `auto`,
                    maxWidth: rhythm(24),
                    padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
                }}
            >
                <header> {header} </header> <main> {children} </main>
            </div>
        )
    }
}

export default Layout
