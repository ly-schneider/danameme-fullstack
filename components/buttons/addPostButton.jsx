"use client";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";

export default function AddPostButton({ selected }) {
  const router = useRouter();

  function handleClick() {
    router.push("/create/");
  }

  return (
    <>
      <Tooltip
        content="Post erstellen"
        className="text-sm font-medium text-white bg-zinc-800 !mt-2"
      >
        <button
          onClick={handleClick}
          className={`text-background py-1 px-[9px] sm:py-2 sm:px-[13px] rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500 ${
            selected ? "bg-accent" : "bg-text"
          }`}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </Tooltip>
    </>
  );
}
