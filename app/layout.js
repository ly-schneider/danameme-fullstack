import LayoutContainer from "@/components/layoutContainer";
import "./globals.css";

export const metadata = {
  title: "DANAMEME",
  description: "DANAMEME, die Plattform für Campus-Releated Memes!",
};

export default function RootLayout({ children }) {
  return <LayoutContainer children={children} />
}
