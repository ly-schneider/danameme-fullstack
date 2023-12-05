"use client";

import { useEffect, useState } from "react";

export default function Third({ formData, setFormData, page, setPage }) {
  const [firstname, setFirstname] = useState("");
  const [errorFirstname, setErrorFirstname] = useState("");
  const [firstnameTryed, setFirstnameTryed] = useState(false);

  const [lastname, setLastname] = useState("");
  const [errorLastname, setErrorLastname] = useState("");
  const [lastnameTryed, setLastnameTryed] = useState(false);

  useEffect(() => {
    if (formData.firstname != "") {
      setFirstname(formData.firstname);
    }

    if (formData.lastname != "") {
      setLastname(formData.lastname);
    }
  }, []);

  useEffect(() => {
    if (firstname == "" && firstnameTryed) {
      setErrorFirstname("Vorname darf nicht leer sein!");
    } else {
      setErrorFirstname("");
    }
  }, [firstname]);

  useEffect(() => {
    if (lastname == "" && lastnameTryed) {
      setErrorLastname("Nachname darf nicht leer sein!");
    } else {
      setErrorLastname("");
    }
  }, [lastname]);

  function handleValidationFirstname() {
    if (firstname == "" && !firstnameTryed) {
      setErrorFirstname("Vorname darf nicht leer sein!");
      return false;
    } else {
      setErrorFirstname("");
    }
    setFirstnameTryed(true);
  }

  function handleValidationLastname() {
    if (lastname == "" && !lastnameTryed) {
      setErrorLastname("Nachname darf nicht leer sein!");
      return false;
    } else {
      setErrorLastname("");
    }
    setLastnameTryed(true);
  }

  async function handleSubmit(e) {
    let formError = false;
    e.preventDefault();

    if (firstname == "") {
      setErrorFirstname("Vorname darf nicht leer sein!");
      formError = true;
    }

    if (lastname == "") {
      setErrorLastname("Nachname darf nicht leer sein!");
      formError = true;
    }

    if (formError) {
      return false;
    }

    setFormData({ ...formData, firstname: firstname, lastname: lastname });
    setPage(4);
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="mt-8">
      <div>
        <label
          className={
            "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
            (errorFirstname != "" ? " bg-error opacity-50" : " bg-primary ")
          }
          htmlFor="firstname"
        >
          Vorname
        </label>
        {errorFirstname != "" && (
          <div className="bg-error rounded-t-div px-3 py-2 text-text text text-sm">
            {errorFirstname}
          </div>
        )}
        <input
          className={
            "input w-full" +
            (errorFirstname != ""
              ? " border-error rounded-b-form rounded-t-none"
              : "")
          }
          type="text"
          id="firstname"
          autoComplete="firstname"
          value={firstname}
          onBlur={handleValidationFirstname}
          onChange={(e) => setFirstname(e.target.value)}
        />
      </div>
      <div className="mt-5">
        <label
          className={
            "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
            (errorLastname != "" ? " bg-error opacity-50" : " bg-primary ")
          }
          htmlFor="lastname"
        >
          Nachname
        </label>
        {errorLastname != "" && (
          <div className="bg-error rounded-t-div px-3 py-2 text-text text text-sm">
            {errorLastname}
          </div>
        )}
        <input
          className={
            "input w-full" +
            (errorLastname != ""
              ? " border-error rounded-b-form rounded-t-none"
              : "")
          }
          id="lastname"
          autoComplete="lastname"
          type="text"
          value={lastname}
          onBlur={handleValidationLastname}
          onChange={(e) => setLastname(e.target.value)}
        />
      </div>
      <div className="flex justify-between mt-5">
        <button
          className="btn-secondary text text-sm"
          onClick={() => setPage(2)}
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
