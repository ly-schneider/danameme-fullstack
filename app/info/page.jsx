import Link from "next/link";

export default function InfoPage() {
  return (
    <>
      <div className="px-4">
        <div>
          <h1 className="title text-2xl">DANAMEME</h1>
          <div className="text space-y-4 mt-2">
            <p>
              DANAMEME ist eine Open-Source Social-Media-Plattform, welche
              selbständig entwickelt worden ist.
            </p>
            <p>
              Die Idee hinter DANAMEME ist es, eine Plattform zu schaffen, auf
              der der gesamte Campus Campus-bezogene Memes oder IT-Memes posten
              kann. Ursprünglich entstand DANAMEME aus der Idee, 8einen
              Subreddit zu erstellen. Da uns (Team DANAMIKE) dies jedoch
              untersagt wurde, habe ich mich entschieden, eine eigene Plattform
              zu entwickeln. Ich habe mich sofort an die Arbeit gemacht, um dies
              zu realisieren.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <p className="text text-sm">
            Lese mehr{" "}
            <Link href={"/about"} className="underline">
              über mich
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
