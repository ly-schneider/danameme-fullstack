"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

export default function Sixth({ formData, setFormData, page, setPage }) {
  return (
    <div className="mt-8">
      <p className="text-center text text-xl font-semibold">
        Die Registrierung wurde erfolgreich abgeschlossen!
      </p>
      <p className="text-center text text-lg mt-3">
        Du kannst erst interagieren, sobald du verifiziert bist. Bis dahin,
        kannst du Beiträge, Kommentare und Profile ansehen ohne zu interagieren.
      </p>
      <div className="flex justify-center mt-8">
        <button
          className="btn-primary text"
          onClick={() => {
            location.href = "/";
          }}
        >
          <FontAwesomeIcon icon={faHouse} className="mr-2" />
          Home
        </button>
      </div>
    </div>
  );
}
