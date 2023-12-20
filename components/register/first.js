"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../supabase";
import { Tooltip } from "flowbite-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";

export default function First({ formData, setFormData, page, setPage }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const [tryed, setTryed] = useState(false);

  useEffect(() => {
    if (formData.code != 0) {
      setCode(formData.code);
    }
  }, []);

  useEffect(() => {
    if (code.length != 6 && code.length != 0 && tryed) {
      setError("Der Code muss 6 Stellen haben!");
    } else {
      setError("");
    }
  }, [code]);

  function handleValidation() {
    if (code.length != 6 && code.length != 0 && !tryed) {
      setError("Der Code muss 6 Stellen haben!");
      return false;
    }
    setTryed(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { data, error } = await supabase
      .from("code")
      .select("id_code")
      .eq("code", code)
      .single();

    if (data == null) {
      setError("Code ist ungültig!");
      setTimeout(() => {
        setError("");
      }, 4000);
      return false;
    }

    if (error) {
      setError("Es gab einen Fehler, den Code zu überprüfen!");
      setTimeout(() => {
        setError("");
      }, 4000);
      return false;
    }

    if (data.id_code != 1 && data.id_code != 2) {
      setError("Code ist ungültig!");
      setTimeout(() => {
        setError("");
      }, 4000);
      return false;
    }

    setFormData({ ...formData, code: code });
    setPage(2);
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="mt-8">
      <div className="flex justify-between items-center">
        <p className="text mb-3">
          Gib einen Internen oder Externen Code an, um weiterzufahren.
        </p>
        <Tooltip
          content="Der Interne Code findest du auf dem Plakat im BA-Raum."
          className="max-w-[200px] bg-accentBackground text-text text-sm"
          placement="right"
        >
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="text hover:cursor-pointer"
          />
        </Tooltip>
      </div>
      <label
        className={
          "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
          (error != "" ? " bg-error opacity-50" : " bg-primary ")
        }
        htmlFor="code"
      >
        Code
      </label>
      {error != "" && (
        <div className="bg-error rounded-t-div px-3 py-2 text-text text text-sm">
          {error}
        </div>
      )}
      <input
        className={
          "input w-full" +
          (error != "" ? " border-error rounded-b-form rounded-t-none" : "")
        }
        id="code"
        type="number"
        autoComplete="off"
        required
        value={code}
        onBlur={handleValidation}
        onChange={(e) => setCode(e.target.value)}
      />
      <span className="text text-sm mt-2 ms-1.5 text-muted">
        6-Stelliger Code
      </span>
      <div className="flex justify-between mt-3">
        <Link href="/login">
          <button className="btn-secondary text text-sm" type="button">
            Anmelden
          </button>
        </Link>
        <button className="btn-primary text text-sm" type="submit">
          Überprüfen
        </button>
      </div>
    </form>
  );
}
