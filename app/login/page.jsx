"use client";

import supabase from "@/components/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState("");

  const [password, setPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      setErrorEmail("Bitte geben Sie eine E-Mail Adresse ein.");
    } else if (!email.includes("@") || !email.includes(".")) {
      setErrorEmail("Bitte geben Sie eine gültige E-Mail Adresse ein.");
    } else {
      setErrorEmail("");
    }

    if (!password) {
      setErrorPassword("Bitte geben Sie ein Passwort ein.");
    } else {
      setErrorPassword("");
    }

    if (email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setErrorEmail("E-Mail Adresse oder Passwort ist falsch.");
        setErrorPassword("E-Mail Adresse oder Passwort ist falsch.");
        return false;
      }

      router.push("/");
    }
  }

  return (
    <div className="mx-20">
      <h1 className="title text-center font-bold">Login</h1>
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-between mt-5">
          <Link href="/register">
            <button className="btn-secondary text text-sm" type="submit">
              Registrieren
            </button>
          </Link>
          <button className="btn-primary text text-sm" type="submit">
            Anmelden
          </button>
        </div>
      </form>
    </div>
  );
}
