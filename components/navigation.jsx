import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";

export default function Navigation() {

  return (
    <nav className="bg-background w-full items-center inline-flex flex-row">
      <div className="items-center inline-flex flex-row flex-grow justify-around py-2">
        <div className="w-1/3 flex justify-start">
          <Link href="/">
            <div className="inline-flex flex-row items-center ms-8">
              <img
                src="/no-image.png"
                alt="Logo of DANAMEME"
                className="h-8 w-8 me-3 rounded-full"
              />
              <h1 className="text-2xl text-textPrimary">DANAMEME</h1>
            </div>
          </Link>
        </div>
        <div className="w-1/3 flex justify-end">
          <div className="inline-flex justify-start mx-8 items-center text-textSecondary fill-textSecondary text-xl">
            <a
              onClick={renderNotifications}
              className="hover:cursor-pointer hover:bg-secondaryAccent p-2 rounded-posts"
            >
              <FontAwesomeIcon icon={faBell} />
            </a>
          </div>
          <div className="flex me-8">
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle="dropdown"
              className="p-1 text-center inline-flex items-center border border-transparent hover:border-borderColor rounded-posts pe-2 text-textSecondary font-nunito"
              type="button"
            >
              <div className="flex flex-row items-center">
                <img
                  src="/profile-image-default.png"
                  alt="No image"
                  className="h-8 w-8 rounded-full"
                />
                <div className="inline ps-2 text-start items-center font-nunito">
                  <p className="text-sm mb-0 text-textSecondary">
                    ly-schneider
                  </p>
                  <p className="mb-0 text-xs text-textSecondary">44 Karma</p>
                </div>
              </div>
              <svg
                className="w-2.5 h-2.5 ml-8 text-bars"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}