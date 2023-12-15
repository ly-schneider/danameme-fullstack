"use client";

import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";

export default function HomeButton({ selected }) {
  const router = useRouter();

  function handleClick() {
    router.push("/");
  }

  return (
    <>
      <Tooltip
        content="Home"
        className="text-sm font-medium text-white bg-zinc-800 !mt-2"
      >
        <button
          onClick={handleClick}
          className={`text-background py-[4.5px] px-[8px] sm:py-2 sm:px-3 rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500 ${
            selected ? "bg-accent" : "bg-text"
          }`}
        >
          <FontAwesomeIcon icon={faHome} />
        </button>
      </Tooltip>
    </>
  );
}
