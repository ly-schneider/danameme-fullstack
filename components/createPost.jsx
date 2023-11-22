"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-regular-svg-icons";

function CreatePost() {
  return (
    <>
      <div className="flex flex-row w-full justify-between mt-7 items-center">
        <div className="justify-start flex flex-inline items-center">
          <img
            src="/profile-image-default.png"
            alt="No image"
            className="h-11 w-11 rounded-full"
          />
          <h3 className="ms-3 font-nunito font-semibold text-2xl">
            lyschneider
          </h3>
        </div>
        <div className="flex justify-end">
          <button className="font-nunito font-bold rounded-buttons bg-background text-md px-8 py-1.5">
            Post
          </button>
        </div>
      </div>
      <input className="w-full mt-6 py-3 px-3 rounded-[15px] bg-gradient-to-r from-[#251F1F] to-[#353434] font-gabarito"></input>
      <button className="py-1.5 px-8 rounded-buttons font-nunito font-bold bg-background text-sm mt-3">
        <FontAwesomeIcon icon={faSquarePlus} className="me-1.5 text-sm" />
        Bild anhängen
      </button>
    </>
  );
}

export default CreatePost;
