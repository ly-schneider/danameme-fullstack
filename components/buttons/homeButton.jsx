"use client";

import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "flowbite-react";

export default function HomeButton() {

  return (
    <>
      <Tooltip content="Home" className="text-sm font-medium text-white bg-zinc-800 !mt-2">
        <button
          className="bg-text text-background py-2 px-3 rounded-full mt-4 me-3 border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500"
        >
          <FontAwesomeIcon icon={faHome} />
        </button>
      </Tooltip>
    </>
  );
}