"use client";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="flex flex-col md:flex-row bg-accentBackground w-full mt-auto py-8 items-center px-5 space-y-6 md:space-y-0">
        <div className="w-full md:w-1/3">
          <h1 className="title">DANAMEME</h1>
          <p className="text-muted text-lato text-sm font-semibold">
            © Copyright 2023 - Levyn Schneider
          </p>
        </div>
        <div className="flex text-text font-lato font-semibold w-full md:w-1/3 justify-start md:justify-center space-x-8">
          <ul>
            <Link href="/" className="hover:underline">
              <li>Info</li>
            </Link>
            <Link href="/about" className="hover:underline">
              <li>Über mich</li>
            </Link>
            {/* <li>Datenschutz</li> */}
          </ul>
          <ul className="text-muted">
            <li>Registrierung</li>
            <li>Login</li>
            <li>Profil</li>
          </ul>
        </div>
        <div className="w-full md:w-1/3 justify-start md:justify-end text-start md:text-end">
          <Link
            href="https://github.com/BA-2023-2024/danameme-fullstack"
            target="_blank"
          >
            <button className="bg-text text-background py-1.5 px-2 rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500">
              <FontAwesomeIcon icon={faGithub} className="text-2xl" />
            </button>
          </Link>
        </div>
      </footer>
    </>
  );
}
