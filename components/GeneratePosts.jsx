import { faComment, faHeart, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function GeneratePosts() {
  return (
    <>
      <div className="mt-8">
        <div className="flex justify-between">
          <div className="flex items-center">
            <img
              src="/profile-image-default.png"
              alt="No image"
              className="h-9 w-9 rounded-full"
            />
            <h3 className="ms-3 font-nunito font-semibold text-lg text-textSecondary ">
              lyschneider
            </h3>
          </div>
          <div className="flex items-center text-textSecondary font-nunito font-semibold">
            <p className="text-sm me-4">vor 2 Tagen</p>
            <FontAwesomeIcon icon={faEllipsis} className="text-xl" />
          </div>
        </div>
        <div className="mt-2">
          <h1 className="font-nunito font-bold text-2xl">My Title</h1>
          <p className="font-nunito text-lg font-normal leading-[24px]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae
            et magnam iusto ipsam veritatis voluptatum deserunt nam alias
            officia aliquid maxime reprehenderit, facere
          </p>
        </div>
        <div className="w-full h-[300px] overflow-hidden mt-2 rounded-images">
          <img src="/defragged-zebra.jpg" className="w-full"/>
        </div>
        <div className="flex mt-3 space-x-2 text-2xl">
          <FontAwesomeIcon icon={faHeart} />
          <FontAwesomeIcon icon={faComment} flip="horizontal"/>
          <FontAwesomeIcon icon={faPaperPlane} />
        </div>
        <div className="mt-2">
          <p className="font-nunito font-medium text-sm ">Gefällt 30 Mal</p>
        </div>
        <div className="mt-0">
          <p className="font-nunito font-medium text-sm text-textSecondary">2 Kommentare ansehen</p>
        </div>
      </div>
    </>
  );
}
