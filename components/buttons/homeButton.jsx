"use client";

import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";

export default function HomeButton() {
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
          className="bg-text text-background py-2 px-3 rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500"
        >
          <FontAwesomeIcon icon={faHome} />
        </button>
      </Tooltip>
    </>
  );
}
