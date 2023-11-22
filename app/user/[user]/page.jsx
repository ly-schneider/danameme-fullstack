import { faCalendar, faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function Create({ params }) {
  return (
    <>
      <div className="mt-4">
        <div>
          <button className="font-nunito font-bold rounded-buttons bg-background text-sm px-6 py-2">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Zurück
          </button>
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex items-center">
            <img
              src="/profile-image-default.png"
              alt="No image"
              className="h-24 w-24 rounded-full"
            />
            <h3 className="ms-5 font-nunito font-bold text-3xl text-textPrimary ">
              lyschneider
            </h3>
          </div>
          <div className="flex items-center">
            <button className="font-nunito font-semibold rounded-buttons bg-background text-sm px-6 py-2 me-4 text-textPrimary">
              Folgen
            </button>
            <FontAwesomeIcon icon={faEllipsis} className="text-2xl text-textSecondary" />
          </div>
        </div>
        <div className="flex mt-2 font-nunito text-textAccent items-center">
          <FontAwesomeIcon icon={faCalendarDays} className="me-2 text-lg pb-[4px]" />
          <p className="text-sm">Beigetreten 19. Juni 2023</p>
        </div>
        <div className="flex mt-2 font-nunito font-semibold space-x-5">
          <h1>29 Followers</h1>
          <h1>34 Beiträge</h1>
        </div>
        <div className="flex">
          
        </div>
      </div>
    </>
  );
}
