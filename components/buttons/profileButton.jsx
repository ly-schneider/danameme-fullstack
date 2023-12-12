"use client";

import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";

export default function ProfileButton({ selected }) {
  const router = useRouter();

  function handleClick() {
    router.push("/p/");
  }

  console.log(selected);

  return (
    <>
      <Tooltip
        content="Profil"
        className="text-sm font-medium text-white bg-zinc-800 !mt-2"
      >
        <button
          onClick={handleClick}
          className={`text-background py-2 px-[13px] rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500 ${
            selected ? "bg-accent" : "bg-text"
          }`}
        >
          <FontAwesomeIcon icon={faUser} />
        </button>
      </Tooltip>
    </>
  );
}
