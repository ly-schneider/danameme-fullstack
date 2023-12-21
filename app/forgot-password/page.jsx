"use client";

import { checkBan } from "@/components/auth/checkBan";
import { calcTime } from "@/components/other/calcTime";
import supabase from "@/components/supabase";
import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [successEmail, setSuccessEmail] = useState("");

  const [waiting, setWaiting] = useState(false);

  async function handleSubmit(e) {
    let formError = false;
    e.preventDefault();

    if (email == "") {
      setErrorEmail("E-Mail Adresse muss vorhanden sein!");
      formError = true;
    } else if (!email.includes("@") || !email.includes(".")) {
      setErrorEmail("E-Mail Adresse ist ungültig!");
      formError = true;
    }

    if (!formError) {
      setWaiting(true);

      let redirectUrl = window.location.hostname;
      if (redirectUrl == "localhost") {
        redirectUrl =
          window.location.protocol +
          "//" +
          window.location.host +
          "/update-password/";
      } else {
        redirectUrl = redirectUrl + "/update-password/";
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.log(error);
        setWaiting(false);
        return false;
      }

      setWaiting(false);

      setSuccessEmail("E-Mail wurde versendet! Überprüfe deinen Posteingang.");
    }
  }

  return (
    <>
      <div className="mx-12 sm:mx-20 mt-8">
        <h1 className="title text-center font-bold">Passwort vergessen</h1>
        <p className="text mt-4 mb-0">
          Gib deine E-Mail Adresse ein, um dein Passwort zurückzusetzen.
        </p>
        <form onSubmit={(e) => handleSubmit(e)} className="mt-4">
          <div>
            <label
              className={
                "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
                (errorEmail != "" ? " bg-error opacity-50" : " bg-primary ")
              }
              htmlFor="email"
            >
              E-Mail Adresse
            </label>
            {errorEmail != "" && (
              <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
                {errorEmail}
              </div>
            )}
            <input
              className={
                "input w-full" +
                (errorEmail != ""
                  ? " border-error rounded-b-form rounded-t-none"
                  : "")
              }
              type="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {successEmail != "" && (
              <div className="bg-success font-bold mt-2 mb-2 rounded-div px-3 py-2 text-background text text-sm flex flex-row justify-between items-center">
                <span>{successEmail}</span>
                <FontAwesomeIcon
                  icon={faXmark}
                  onClick={() => setSuccessEmail("")}
                  className="hover:cursor-pointer"
                />
              </div>
            )}
          </div>
          <div className="flex justify-between mt-5">
            <button
              onClick={() => router.back()}
              className="btn-secondary text text-sm"
              type="button"
            >
              Zurück
            </button>
            <button className="btn-primary text text-sm" type="submit">
              Zurücksetzen{" "}
              {waiting && (
                <FontAwesomeIcon icon={faSpinner} className="ms-2" spin />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
