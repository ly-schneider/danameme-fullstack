"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import supabase from "../supabase";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CodeToBadge from "../codeToBadge";

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

  const [badges, setBadges] = useState([]);
  const [errorBadges, setErrorBadges] = useState("");
  const [successBadges, setSuccessBadges] = useState("");

  const [code, setCode] = useState("");

  useEffect(() => {
    setUsername(profile.username);
    setBiography(profile.biography);
    setProfileimage(profile.profileimage);
    console.log(profile.profileimage);
  }, [profile]);

  useEffect(() => {
    async function getData() {
      const badges = await getBadges(profile);
      console.log(badges);
      setBadges(badges);
    }
    getData();
  }, []);

  async function getBadges(profile) {
    const { data, error } = await supabase
      .from("profile_badge")
      .select("badge_id")
      .eq("profile_id", profile.id_profile);

    if (error) {
      console.log(error);
      return false;
    }

    const badgesTemp = {};

    const badgePromises = data.map(async (badge) => {
      const { data, error } = await supabase
        .from("badge")
        .select("text, class")
        .eq("id_badge", badge.badge_id);

      if (error) {
        console.log(error);
        return false;
      }

      badgesTemp[badge.badge_id] = data[0];
    });

    await Promise.all(badgePromises);

    let sortedArrray = [];

    Object.keys(badgesTemp)
      .sort()
      .reverse()
      .forEach((key) => {
        console.log(key);
        sortedArrray.push({
          key: key,
          class: badgesTemp[key].class,
          text: badgesTemp[key].text,
        });
      });

    console.log(sortedArrray);

    return sortedArrray;
  }

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
      setErrorProfileimage(
        "Beim Hochladen des Bildes ist ein Fehler aufgetreten."
      );
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

    setSuccessProfileimage("Profilbild erfolgreich aktualisiert!");
    location.reload();
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

  async function handleRemoveBadge(badgeId) {
    const { data, error } = await supabase
      .from("profile_badge")
      .delete()
      .eq("profile_id", profile.id_profile)
      .eq("badge_id", badgeId);

    if (error) {
      console.log(error);
      setErrorBadges("Ein Fehler ist aufgetreten.");
      return;
    }

    setSuccessBadges("Badge erfolgreich entfernt!");

    setTimeout(() => {
      location.reload();
    }, 1000);
  }

  async function addCode() {
    if (code.length != 6) {
      setErrorBadges("Der Code muss 6-stellig sein.");
      return;
    }

    const badge = await CodeToBadge(code);
    if (badge == false) {
      setErrorBadges("Der Code ist ungültig.");
      return;
    }

    console.log(badge);

    const { data, error } = await supabase
      .from("profile_badge")
      .insert({ profile_id: profile.id_profile, badge_id: badge.id_badge });

    if (error) {
      console.log(error);
      setErrorBadges("Ein Fehler ist aufgetreten.");
      return;
    }

    setSuccessBadges("Badge erfolgreich hinzugefügt!");

    setTimeout(() => {
      location.reload();
    }, 1000);
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
        <div className="flex flex-col sm:flex-row items-center mb-4">
          <h1 className="title text-lg font-semibold w-full sm:w-1/4">Username</h1>
          <div className="flex justify-between sm:justify-end space-x-3 w-full sm:w-3/4 mt-3 sm:mt-0">
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
        <div className="flex flex-col sm:flex-row items-center mb-4">
          <h1 className="title text-lg font-semibold w-full sm:w-1/4">Biografie</h1>
          <div className="flex space-x-3 w-full sm:w-3/4 mt-3 sm:mt-0">
            <textarea
              placeholder="Leer"
              rows={4}
              className="input text text-sm w-full"
              onChange={(e) => setBiography(e.target.value)}
              value={biography}
            />
          </div>
          <button
            className={"mt-3 sm:mt-0 w-full sm:w-auto sm:ms-3 ms-0" + 
              (biography == profile.biography
                ? " btn-secondary text-muted pointer-events-none hover:cursor-default"
                : " btn-primary border-[3px] border-primary")
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
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-4 mt-2">
          <h1 className="title text-lg font-semibold w-full text-center sm:text-start sm:w-1/4">Profilbild</h1>
          <img
            src={
              typeof profileimage === "string" || profileimage instanceof String
                ? profileimage
                : URL.createObjectURL(profileimage)
            }
            className="w-24 h-24 rounded-full border-[3px] border-accent object-cover mt-2"
          />
          <div className="mt-3">
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
        {errorBadges != "" && (
          <div className="bg-error font-bold my-2 rounded-div px-3 py-2 text-text text text-sm flex flex-row justify-between items-center">
            <span>{errorBadges}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setErrorBadges("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        {successBadges != "" && (
          <div className="bg-success font-bold mt-2 mb-2 rounded-div px-3 py-2 text-background text text-sm flex flex-row justify-between items-center">
            <span>{successBadges}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setSuccessBadges("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between mb-4 mt-2">
          <h1 className="title text-lg font-semibold w-1/4">Badges</h1>
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-4 mt-3">
              {Object.keys(badges).map((badge) => {
                const item = badges[badge];
                let text = item.text;
                const arrayBadges = [1, 2, 6, 7, 8, 9];
                if (text == null) {
                  text = "#" + profile.userCount;
                }
                return (
                  <div
                    className={
                      item.class +
                      " px-5 py-1.5 rounded-badge flex justify-between items-center"
                    }
                    key={item.key}
                  >
                    <p className="text-text text text-sm">{text}</p>
                    {!arrayBadges.includes(parseInt(item.key)) && (
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="text-text ms-2 hover:cursor-pointer"
                        onClick={() => handleRemoveBadge(item.key)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="w-full mt-5">
              <label
                className={
                  "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
                  (errorBadges != "" ? " bg-error opacity-50" : " bg-primary ")
                }
                htmlFor="code"
              >
                Code
              </label>
              {errorBadges != "" && (
                <div className="bg-error rounded-t-div px-3 py-2 text-text text text-sm">
                  {errorBadges}
                </div>
              )}
              <input
                className={
                  "input w-full" +
                  (errorBadges != ""
                    ? " border-error rounded-b-form rounded-t-none"
                    : "")
                }
                type="number"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button
              className={
                "rounded-button text-text text-sm mt-4 h-[42px] border-[3px] border-primary " +
                (code.length != 6
                  ? " btn-secondary pointer-events-none cursor-default"
                  : " btn-primary")
              }
              type="button"
              onClick={addCode}
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
