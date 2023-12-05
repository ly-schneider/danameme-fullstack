import Footer from "@/components/footer";
import "./globals.css";
import Navigation from "@/components/navigation";

export const metadata = {
  title: "DANAMEME",
  description: "DANAMEME, die Plattform für Campus-Releated Memes!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className="bg-background flex min-h-screen flex-col items-center ">
        <Navigation />
        <main className="justify-center mx-auto container max-w-xl mb-16">
          <div className="mx-auto">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
