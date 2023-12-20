import Navigation from "@/components/navigation";
import "./globals.css";
import Container from "@/components/container";
import Script from "next/script";
import Footer from "@/components/footer";

export const metadata = {
  title: "DANAMEME",
  description: "DANAMEME, die Plattform für Campus-Releated Memes!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className="bg-background flex min-h-screen flex-col items-center ">
        <Navigation />
        <Container>{children}</Container>
        <Footer />
      </body>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-7FQS2RPPYQ" />
      <Script id="google-analytics">
        {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'G-7FQS2RPPYQ');
                `}
      </Script>
    </html>
  );
}
