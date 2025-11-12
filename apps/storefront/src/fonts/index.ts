// Temporary workaround: Using system font due to network issues with Google Fonts
// Original font was Manrope from Google Fonts
// To restore, fix network connection to fonts.googleapis.com and uncomment below:
// import { Manrope } from "next/font/google";
// export const aspekta = Manrope({
//   subsets: ["latin", "latin-ext", "cyrillic"],
//   display: "swap",
//   weight: ["400", "500", "600", "700", "800"],
//   variable: "--font-sans",
// });

// Using system font as fallback
export const aspekta = {
  variable: "--font-sans",
  className: "",
};
