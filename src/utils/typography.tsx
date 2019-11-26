import Typography from "typography";
import lincolnTheme from "typography-theme-lincoln";

// lincolnTheme.overrideThemeStyles = () => {
//   return {
//       "h1,h2,h3": {
//           color: `white`,
//           backgroundColor: `black`,
//       },
//     "a.gatsby-resp-image-link": {
//       boxShadow: `none`,
//     },
//   };
// };

// delete lincolnTheme.googleFonts;

// const typography = new Typography(lincolnTheme);

const typography = new Typography({
    googleFonts: [{
        name: "Varela Round",
        styles: ["Regular"],
    },{
        name: "Lato",
        styles: ["Light", "Regular", "Bold"],
    }],
    baseFontSize: `18px`,
    headerFontFamily: ["Varela Round", "sans-serif"],
    bodyFontFamily: ["Lato", "sans-serif"],
});
// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
    typography.injectStyles();
}

export default typography;
export const rhythm = typography.rhythm;
export const scale = typography.scale;
