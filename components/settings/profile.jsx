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

  useEffect(() => {
    setUsername(profile.username);
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
      </div>
    </div>
  );
}
