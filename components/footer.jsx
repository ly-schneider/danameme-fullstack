import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
  return (
    <>
      <footer className="flex flex-row bg-accentBackground w-full mt-auto py-8 items-center px-5">
        <div className="w-1/3">
          <h1 className="title">DANAMEME</h1>
          <p className="text-muted text-lato text-sm font-semibold">© Copyright 2023 - Levyn Schneider</p>
        </div>
        <div className="flex text-text font-lato font-semibold w-1/3 justify-center space-x-8">
          <ul>
            <li>Info</li>
            <li>Über mich</li>
            <li>Datenschutz</li>
          </ul>
          <ul>
            <li>Registrierung</li>
            <li>Login</li>
            <li>Profil</li>
          </ul>
        </div>
        <div className="w-1/3 justify-end text-end">
          <button className="bg-text text-background py-1.5 px-2 rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500">
            <FontAwesomeIcon icon={faGithub} className="text-2xl" />
          </button>
        </div>
      </footer>
    </>
  );
}
