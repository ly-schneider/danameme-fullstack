"use client";

import { useEffect, useState } from "react";
import supabase from "../supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faXmarkCircle,
} from "@fortawesome/free-regular-svg-icons";

export default function Second({ formData, setFormData, page, setPage }) {
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [emailTryed, setEmailTryed] = useState(false);

  const [password, setPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorPasswordConfirm, setErrorPasswordConfirm] = useState("");

  const [minimumLength, setMinimumLength] = useState(false);
  const [uppperAndLowerCase, setUpperAndLowerCase] = useState(false);
  const [number, setNumber] = useState(false);

  useEffect(() => {
    if (formData.email != "") {
      setEmail(formData.email);
    }

    if (formData.password != "") {
      setPassword(formData.password);
      setPasswordConfirm(formData.password);
    }
  }, []);

  useEffect(() => {
    if (emailTryed && email != "") {
      if (!email.includes("@") || !email.includes(".")) {
        setErrorEmail("E-Mail Adresse ist ungültig!");
      } else {
        setErrorEmail("");
      }
    } else {
      setErrorEmail("");
    }
  }, [email]);

  useEffect(() => {
    if (password.length >= 8) {
      setMinimumLength(true);
    } else {
      setMinimumLength(false);
    }

    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
      setUpperAndLowerCase(true);
    } else {
      setUpperAndLowerCase(false);
    }

    if (password.match(/[0-9]/)) {
      setNumber(true);
    } else {
      setNumber(false);
    }
  }, [password]);

  function handleValidationEmail() {
    if (!emailTryed && email != "") {
      if (!email.includes("@") || !email.includes(".")) {
        setErrorEmail("E-Mail Adresse ist ungültig!");
        return false;
      }
    } else {
      setErrorEmail("");
    }
    setEmailTryed(true);
  }

  function handleValidationPassword() {
    if (password != passwordConfirm) {
      setErrorPasswordConfirm("Passwörter stimmen nicht überein!");
      return false;
    } else {
      setErrorPasswordConfirm("");
    }
  }

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

    const { data, error } = await supabase
      .from("account")
      .select("email")
      .eq("email", email);

    if (error) {
      setErrorEmail(error.message);
      formError = true;
    }

    if (data.length != 0) {
      setErrorEmail("E-Mail Adresse bereits registriert!");
      formError = true;
    }

    if (password.length < 8) {
      setErrorPassword("Passwort muss mindestens 8 Zeichen lang sein!");
      formError = true;
    }

    if (!password.match(/[a-z]/) || !password.match(/[A-Z]/)) {
      setErrorPassword("Passwort muss Gross- und Kleinbuchstaben enthalten!");
      formError = true;
    }

    if (!password.match(/[0-9]/)) {
      setErrorPassword("Passwort muss eine Zahl enthalten!");
      formError = true;
    }

    if (password != passwordConfirm) {
      setErrorPasswordConfirm("Passwörter stimmen nicht überein!");
      formError = true;
    }

    if (formError) {
      return false;
    }

    setFormData({ ...formData, email: email, password: password });
    setPage(3);
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="mt-8">
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
          onBlur={handleValidationEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mt-5">
        <label
          className={
            "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
            (errorPassword != "" ? " bg-error opacity-50" : " bg-primary ")
          }
          htmlFor="password"
        >
          Passwort
        </label>
        {errorPassword != "" && (
          <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
            {errorPassword}
          </div>
        )}
        <input
          className={
            "input w-full" +
            (errorPassword != ""
              ? " border-error rounded-b-form rounded-t-none"
              : "")
          }
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onBlur={() => setErrorPassword("")}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex-col flex mt-2 ms-1.5 space-y-0.5">
          <span
            className={
              "text text-sm " + (minimumLength ? "text-success" : "text-muted")
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
            (errorPasswordConfirm != ""
              ? " bg-error opacity-50"
              : " bg-primary ")
          }
          htmlFor="passwordConfirm"
        >
          Passwort bestätigen
        </label>
        {errorPasswordConfirm != "" && (
          <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
            {errorPasswordConfirm}
          </div>
        )}
        <input
          className={
            "input w-full" +
            (errorPasswordConfirm != ""
              ? " border-error rounded-b-form rounded-t-none"
              : "")
          }
          id="passwordConfirm"
          autoComplete="new-password"
          type="password"
          onBlur={handleValidationPassword}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
      </div>
      <div className="flex justify-between mt-5">
        <button
          className="btn-secondary text text-sm"
          onClick={() => setPage(1)}
        >
          Zurück
        </button>
        <button className="btn-primary text text-sm" type="submit">
          Weiter
        </button>
      </div>
    </form>
  );
}
