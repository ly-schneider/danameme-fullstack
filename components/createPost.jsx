import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-regular-svg-icons";

export default function CreatePost() {
  return (
    <>
      <div className="flex flex-row w-full justify-between mt-7 items-center">
        <div className="justify-start flex flex-inline items-center">
          <img
            src="/profile-image-default.png"
            alt="No image"
            className="h-9 w-9 rounded-full"
          />
          <h3 className="ms-3 text-textSecondary font-montserrat font-bold text-lg">
            lyschneider
          </h3>
        </div>
      </div>
      <input className="w-full mt-6 py-3 px-3 rounded-[15px] bg-gradient-to-r from-[#251F1F] to-[#353434] font-gabarito"></input>
      <textarea
        className="w-full mt-6 py-3 px-3 rounded-[15px] bg-gradient-to-r from-[#251F1F] to-[#353434] font-gabarito"
        rows={5}
      ></textarea>
      <div className="flex flex-row w-full justify-between mt-2 items-center">
        <button className="py-1.5 px-8 rounded-buttons font-nunito font-bold bg-background text-sm">
          <FontAwesomeIcon icon={faSquarePlus} className="me-1.5 text-sm" />
          Bild anhängen
        </button>
        <button className="py-1.5 px-8 rounded-buttons font-nunito font-bold bg-background text-sm">
          Posten
        </button>
      </div>
    </>
  );
}
