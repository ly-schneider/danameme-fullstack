"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import supabase from "../supabase";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ProfileSettings({ profile }) {
  const router = useRouter();
  const [username, setUsername] = useState(profile.username);
  const [errorUsername, setErrorUsername] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");

  const [biography, setBiography] = useState(profile.biography);
  const [errorBiography, setErrorBiography] = useState("");
  const [successBiography, setSuccessBiography] = useState("");

  const [profileimage, setProfileimage] = useState(profile.profileimage);
  const [errorProfileimage, setErrorProfileimage] = useState("");
  const [successProfileimage, setSuccessProfileimage] = useState("");

  useEffect(() => {
    setUsername(profile.username);
    setBiography(profile.biography);
    setProfileimage(profile.profileimage);
    console.log(profile.profileimage);
  }, [profile]);

  async function handleUpdateUsername() {
    if (username == profile.username) {
      return;
    }

    const { data: checkUsername, error: checkUsernameError } = await supabase
      .from("profile")
      .select("username")
      .eq("username", username);

    if (checkUsernameError) {
      console.log(checkUsernameError);
      return;
    }

    if (checkUsername.length != 0) {
      setErrorUsername("Dieser Username ist bereits vergeben.");
      return;
    }

    const { data, error } = await supabase
      .from("profile")
      .update({ username: username })
      .eq("id_profile", profile.id_profile);

    if (error) {
      console.log(error);
      setErrorUsername("Ein Fehler ist aufgetreten.");
      return;
    }

    setUsernameSuccess("Username erfolgreich aktualisiert!");

    setTimeout(() => {
      location.href = "/p/" + username;
    }, 1000);
  }

  async function handleUpdateBiography() {
    if (biography == profile.biography) {
      return;
    }

    const { data, error } = await supabase
      .from("profile")
      .update({ biography: biography })
      .eq("id_profile", profile.id_profile);

    if (error) {
      console.log(error);
      setErrorBiography("Ein Fehler ist aufgetreten.");
      return;
    }

    setSuccessBiography("Biografie erfolgreich aktualisiert!");

    setTimeout(() => {
      router.refresh();
    }, 1000);
  }

  async function handleUpdateProfileimage(file) {
    const { error } = await supabase.storage
      .from("profile-images")
      .upload(profile.username + "-profileimage.jpg", file, {
        upsert: true,
      });

    if (error) {
      console.log(error);
      setErrorProfileimage("Beim Hochladen des Bildes ist ein Fehler aufgetreten.");
      return;
    }

    const { data: url } = supabase.storage
      .from("profile-images")
      .getPublicUrl(profile.username + "-profileimage.jpg");

    console.log(url);
    
    const { error: updateError } = await supabase
      .from("profile")
      .update({ profileimage: url.publicUrl })
      .eq("id_profile", profile.id_profile);

    if (updateError) {
      console.log(updateError);
      setErrorProfileimage("Ein Fehler ist aufgetreten.");
      return;
    }
  }

  function handleFileChange(event) {
    const input = event.target;
    if (input.files.length > 0) {
      setProfileimage(input.files[0]);
      handleUpdateProfileimage(input.files[0]);
    } else {
      setProfileimage(null);
    }
  }

  return (
    <div className="flex flex-col items-center w-full text">
      <div className="flex flex-col w-full mt-8">
        {errorUsername != "" && (
          <div className="bg-error font-bold my-2 rounded-div px-3 py-2 text-text text text-sm flex flex-row justify-between items-center">
            <span>{errorUsername}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setErrorUsername("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        {usernameSuccess != "" && (
          <div className="bg-success font-bold mt-2 mb-2 rounded-div px-3 py-2 text-background text text-sm flex flex-row justify-between items-center">
            <span>{usernameSuccess}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setUsernameSuccess("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        <div className="flex flex-row items-center mb-4">
          <h1 className="title text-lg font-semibold w-1/4">Username</h1>
          <div className="flex flex-end space-x-3 w-3/4">
            <input
              type="email"
              className="input text text-sm px-8 w-full text-center"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
            <button
              className={
                username == profile.username
                  ? " btn-secondary text-muted pointer-events-none hover:cursor-default"
                  : " btn-primary"
              }
              onClick={handleUpdateUsername}
            >
              Aktualisieren
            </button>
          </div>
        </div>
        {errorBiography != "" && (
          <div className="bg-error font-bold my-2 rounded-div px-3 py-2 text-text text text-sm flex flex-row justify-between items-center">
            <span>{errorBiography}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setErrorBiography("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        {successBiography != "" && (
          <div className="bg-success font-bold mt-2 mb-2 rounded-div px-3 py-2 text-background text text-sm flex flex-row justify-between items-center">
            <span>{successBiography}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setSuccessBiography("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        <div className="flex flex-row items-center mb-4">
          <h1 className="title text-lg font-semibold w-1/4">Biografie</h1>
          <div className="flex space-x-3 w-3/4">
            <textarea
              placeholder="Leer"
              rows={4}
              className="input text text-sm w-full"
              onChange={(e) => setBiography(e.target.value)}
              value={biography}
            />
          </div>
          <button
            className={
              biography == profile.biography
                ? " btn-secondary text-muted pointer-events-none hover:cursor-default ms-3"
                : " btn-primary ms-3 border-[3px] border-primary"
            }
            onClick={handleUpdateBiography}
          >
            Aktualisieren
          </button>
        </div>
        {errorProfileimage != "" && (
          <div className="bg-error font-bold my-2 rounded-div px-3 py-2 text-text text text-sm flex flex-row justify-between items-center">
            <span>{errorProfileimage}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setErrorProfileimage("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        {successProfileimage != "" && (
          <div className="bg-success font-bold mt-2 mb-2 rounded-div px-3 py-2 text-background text text-sm flex flex-row justify-between items-center">
            <span>{successProfileimage}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setSuccessProfileimage("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        <div className="flex flex-row justify-between items-center mb-4 mt-2">
          <h1 className="title text-lg font-semibold w-1/4">Profilbild</h1>
          <img
            src={
              typeof profileimage === "string" || profileimage instanceof String
                ? profileimage
                : URL.createObjectURL(profileimage)
            }
            className="w-24 h-24 rounded-full border-[3px] border-accent object-cover"
          />
          <div>
            <label
              htmlFor="fileInput"
              className="inline-block text cursor-pointer px-5 py-2 btn-primary border-[3px] border-primary"
            >
              Bild ändern
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
