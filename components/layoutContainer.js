"use client";

import React, { useEffect, useState } from "react";
import Navigation from "./navigation";
import Container from "./container";
import Footer from "./footer";
import Script from "next/script";

export default function LayoutContainer({ children }) {
  const launchDate = 1703079000;

  const [time, setTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function getCurrentTime() {
    const currentDate = Math.floor(Date.now() / 1000);
    const remainingTime = launchDate - currentDate;

    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    return `${minutes} Minuten and ${seconds} Sekunden`;
  }

  const currentDate = Math.floor(Date.now() / 1000);

  if (currentDate < launchDate) {
    return (
      <html lang="de">
        <body className="bg-background flex min-h-screen flex-col items-center ">
          <Navigation />
          <Container>
            <div className="flex flex-col items-center justify-center mt-8">
              <h1 className="text-4xl font-bold title text-center">
                DANAMEME launched in {time}!
              </h1>
            </div>
          </Container>
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
  } else {
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
}
