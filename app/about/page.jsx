import { faGithub, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="px-0 mt-8">
      <h1 className="title mx-5 sm:mx-0">Über mich</h1>
      <div className="flex flex-col sm:flex-row mt-4">
        <img
          src="Levyn Schneider.jpg"
          className="rounded-full sm:rounded-[10px] w-2/5 sm:w-1/2 mx-auto sm:mx-0 mb-4 sm:"
        />
        <div className="mx-5 sm:ms-4 sm:mx-0">
          <div className="font-lato font-medium text-base text-text space-y-4">
            <p>
              Hey! Ich bin Levyn, 15 Jahre alt und aktuell in der BA als
              Applikationsentwickler EFZ.
            </p>
            <p>
              Meine Leidenschaft war schon immer das Entwickeln und Realisieren
              von Projekten, unabhängig davon, ob sie einen echten Nutzen haben.
              Außerdem begeistere ich mich für Fotografie und Filmemachen!
            </p>
          </div>
          <div className="flex mt-4 space-x-3">
            <Link href="mailto:levyn@lyschneider.ch" target="_blank">
              <button className="bg-text text-background py-1.5 px-2 rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500">
                <FontAwesomeIcon icon={faEnvelope} className="text-xl" />
              </button>
            </Link>
            <Link href="https://instagram.com/ly.schneider" target="_blank">
              <button className="bg-text text-background py-1.5 px-2 rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500">
                <FontAwesomeIcon icon={faInstagram} className="text-xl" />
              </button>
            </Link>
            <Link href="https://github.com/ly-schneider" target="_blank">
              <button className="bg-text text-background py-1.5 px-2 rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500">
                <FontAwesomeIcon icon={faGithub} className="text-xl" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
