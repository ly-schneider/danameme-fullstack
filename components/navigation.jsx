import Link from "next/link";
import HomeButton from "./buttons/homeButton";

export default function Navigation() {
  return (
    <nav className="bg-background w-full items-center inline-flex flex-row">
      <div className="items-center inline-flex flex-row flex-grow justify-between my-4 mx-5">
        <div>
          <Link href={"/"}>
            <h1 className="title">DANAMEME</h1>
          </Link>
        </div>
        <div>
          <HomeButton />
        </div>
      </div>
    </nav>
  );
}
