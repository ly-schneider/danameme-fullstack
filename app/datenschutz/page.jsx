import Link from "next/link";

export default function DatenschutzPage() {
  return (
    <>
      <div className="px-4 space-y-12 mt-8">
        <div>
          <h1 className="title text-2xl">Datenschutzrichtlinien</h1>
          <div className="text space-y-4 mt-2">
            <p>
              Es werden keine unnötigen Daten gespeichert. Es werden nur die
              Informationen gespeichert, welche zur Nutzung der Applikation
              dienen. Dies sind: Benutzername, E-Mail-Adresse, Passwort, Profil,
              Beiträge, Kommentare, Up- und Downvotes.
            </p>
          </div>
        </div>
        <div>
          <h1 className="title text-2xl">Analyse-Tools</h1>
          <div className="text space-y-4 mt-2">
            <p>
              Für die Weiterentwicklung und Optimierung der Applikation wird Google Analytics
              verwendet. Es werden keine personenbezogenen Daten gespeichert.
            </p>
          </div>
        </div>
        <div>
          <h1 className="title text-2xl">Rechte der Benutzer</h1>
          <div className="text space-y-4 mt-2">
            <p>
              Die Benutzer können jederzeit ihren Account löschen und damit alle
              zusammenhängenden Daten löschen.
            </p>
          </div>
        </div>
        <div>
          <h1 className="title text-2xl">Kontaktinformation</h1>
          <div className="text space-y-0 mt-2">
            <p>Levyn Schneider</p>
            <p>levyn.schneider@ict-campus.net</p>
          </div>
        </div>
      </div>
    </>
  );
}
