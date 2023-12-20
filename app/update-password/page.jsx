"use client";

import { checkBan } from "@/components/auth/checkBan";
import { getSession } from "@/components/auth/getSession";
import { calcTime } from "@/components/other/calcTime";
import supabase from "@/components/supabase";
import {
  faCheckCircle,
  faXmarkCircle,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [errorNewPassword, setErrorNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");

  const [minimumLength, setMinimumLength] = useState(false);
  const [uppperAndLowerCase, setUpperAndLowerCase] = useState(false);
  const [number, setNumber] = useState(false);

  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      console.log(session);
      if (session != false) {
        setHasSession(true);
        setEmail(session.session.user.email);
      }
    }

    checkSession();
  }, []);

  useEffect(() => {
    if (newPassword.length >= 8) {
      setMinimumLength(true);
    } else {
      setMinimumLength(false);
    }

    if (newPassword.match(/[a-z]/) && newPassword.match(/[A-Z]/)) {
      setUpperAndLowerCase(true);
    } else {
      setUpperAndLowerCase(false);
    }

    if (newPassword.match(/[0-9]/)) {
      setNumber(true);
    } else {
      setNumber(false);
    }
  }, [newPassword]);

  function handleValidationPassword() {
    if (newPassword != confirmPassword) {
      setErrorConfirmPassword("Passwörter stimmen nicht überein!");
      return false;
    } else {
      setErrorConfirmPassword("");
    }
  }

  async function handleSubmit(e) {
    let formError = false;
    e.preventDefault();

    if (newPassword.length < 8) {
      setErrorNewPassword("Passwort muss mindestens 8 Zeichen lang sein!");
      formError = true;
    }

    if (!newPassword.match(/[a-z]/) || !newPassword.match(/[A-Z]/)) {
      setErrorNewPassword(
        "Passwort muss Gross- und Kleinbuchstaben enthalten!"
      );
      formError = true;
    }

    if (!newPassword.match(/[0-9]/)) {
      setErrorNewPassword("Passwort muss eine Zahl enthalten!");
      formError = true;
    }

    if (newPassword != confirmPassword) {
      setErrorConfirmPassword("Passwörter stimmen nicht überein!");
      formError = true;
    }

    if (formError) {
      return false;
    }

    const { data: newPasswordData, error: newPasswordError } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    if (newPasswordError) {
      setErrorNewPassword(newPasswordError.message);
      return false;
    }

    setSuccess("Passwort wurde geändert! Weiterleitung...");

    setTimeout(() => {
      location.href = "/";
    }, 3000);
  }

  return (
    <>
      <div className="mx-12 sm:mx-20 mt-8">
        <h1 className="title text-center font-bold">Passwort vergessen</h1>
        {hasSession ? (
          <>
            <p className="text mt-4 mb-0">
              Gib ein neues Passwort für{" "}
              <span className="text-accent">{email}</span> an.
            </p>
            <form onSubmit={(e) => handleSubmit(e)} className="mt-4">
              <div className="mt-5">
                <label
                  className={
                    "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
                    (errorNewPassword != ""
                      ? " bg-error opacity-50"
                      : " bg-primary ")
                  }
                  htmlFor="password"
                >
                  Passwort
                </label>
                {errorNewPassword != "" && (
                  <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
                    {errorNewPassword}
                  </div>
                )}
                <input
                  className={
                    "input w-full" +
                    (errorNewPassword != ""
                      ? " border-error rounded-b-form rounded-t-none"
                      : "")
                  }
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onBlur={() => setErrorNewPassword("")}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="flex-col flex mt-2 ms-1.5 space-y-0.5">
                  <span
                    className={
                      "text text-sm " +
                      (minimumLength ? "text-success" : "text-muted")
                    }
                  >
                    {minimumLength ? (
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    ) : (
                      <FontAwesomeIcon icon={faXmarkCircle} className="me-1" />
                    )}
                    Mindestens 8 Zeichen
                  </span>
                  <span
                    className={
                      "text text-sm " +
                      (uppperAndLowerCase ? "text-success" : "text-muted")
                    }
                  >
                    {uppperAndLowerCase ? (
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    ) : (
                      <FontAwesomeIcon icon={faXmarkCircle} className="me-1" />
                    )}
                    Gross- und Kleinbuchstaben
                  </span>
                  <span
                    className={
                      "text text-sm " + (number ? "text-success" : "text-muted")
                    }
                  >
                    {number ? (
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    ) : (
                      <FontAwesomeIcon icon={faXmarkCircle} className="me-1" />
                    )}
                    Eine Zahl
                  </span>
                </div>
              </div>
              <div className="mt-5">
                <label
                  className={
                    "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
                    (errorConfirmPassword != ""
                      ? " bg-error opacity-50"
                      : " bg-primary ")
                  }
                  htmlFor="passwordConfirm"
                >
                  Passwort bestätigen
                </label>
                {errorConfirmPassword != "" && (
                  <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
                    {errorConfirmPassword}
                  </div>
                )}
                <input
                  className={
                    "input w-full" +
                    (errorConfirmPassword != ""
                      ? " border-error rounded-b-form rounded-t-none"
                      : "")
                  }
                  id="passwordConfirm"
                  autoComplete="new-password"
                  type="password"
                  onBlur={handleValidationPassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
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
                  Ändern
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center w-full mt-8">
            <h1 className="title text-lg font-semibold text-center">
              Du hast keine Berechtigung diese Seite zu sehen.
            </h1>
          </div>
        )}
      </div>
    </>
  );
}
