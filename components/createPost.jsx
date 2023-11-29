"use client";

import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const handleFileChange = (event) => {
    const input = event.target;
    if (input.files.length > 0) {
      setFile(input.files[0]);
    } else {
      setFile(null);
    }
  };

  useEffect(() => {
    async function getProfile() {
      const profile = await JSON.parse(localStorage.getItem("profile"));
      console.log(profile);
      setProfile(profile);
      setUsername(profile.username);
      setProfileImage(profile.profileimage);
    }
    getProfile();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(title);
    console.log(desc);
    console.log(file);
  };
  return (
    <div className="mt-6">
      <div className="flex flex-row items-center">
        <img
          src={profileImage ? profileImage : "/default-pp.png"}
          className="h-11 w-11 "
        />
        <p className="ms-3 text-textSecondary font-bold font-montserrat text-lg">
          {username && (username)}
        </p>
      </div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          placeholder="Titel"
          required
          className="w-full mt-6 py-3 px-3 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
        ></input>
        <textarea
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Beschreibung"
          required
          className="w-full mt-2 py-3 px-3 rounded-[15px] bg-backgroundAccent font-nunito font-semibold resize-none outline-none border-none shadow-none placeholder:text-textAccent placeholder:font-bold"
          rows={5}
        ></textarea>
        <div className="flex flex-row justify-between mt-2">
          <div className="flex flex-row items-center">
            <label
              htmlFor="fileInput"
              className="inline-block cursor-pointer border-none bg-backgroundAccent px-5 py-2 font-nunito font-semibold rounded-buttons text-xs"
            >
              <FontAwesomeIcon icon={faPlusSquare} className="h-3 w-3 me-1" />
              Bild anhängen
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
            <span
              className="ms-2.5 text-xs font-nunito font-semibold"
              id="fileName"
            >
              {file ? file.name : ""}
            </span>
          </div>
          <button
            type="submit"
            className="border-none bg-backgroundAccent px-5 py-2 font-nunito font-semibold rounded-buttons text-xs"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
