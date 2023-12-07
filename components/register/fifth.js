"use client";

import { useEffect, useState } from "react";
import supabase from "../supabase";
import CodeToBadge from "../codeToBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import registerUser from "./registerUser";

export default function Fifth({ formData, setFormData, page, setPage }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [codeBadgeObject, setCodeBadgeObject] = useState({});

  const [badgeList, setBadgeList] = useState([]);

  const [error, setError] = useState("");

  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    if (formData.code != 0) {
      addCodeWithCode(formData.code);
    }
  }, []);

  useEffect(() => {
    if (code.length == 6) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [code]);

  useEffect(() => {
    if (errorCode != "") {
      setTimeout(() => {
        setErrorCode("");
      }, 4000);
    }
  }, [errorCode]);

  useEffect(() => {
    Object.keys(codeBadgeObject).map((key) => {
      const item = codeBadgeObject[key];
      if (badgeList.length == 0) {
        setBadgeList([...badgeList, item.id_badge]);
      } else {
        badgeList.map((badge) => {
          if (badge != item.id_badge) {
            setBadgeList([...badgeList, item.id_badge]);
          }
        });
      }
    });
  }, [codeBadgeObject]);

  async function addCodeWithCode(code) {
    const data = await CodeToBadge(code);
    if (!data) {
      setErrorCode("Der Code konnte nicht überprüft werden!");
      return false;
    }
    if (data == "ungültig") {
      setErrorCode("Der Code ist ungültig!");
      return false;
    }
    setCodeBadgeObject({ ...codeBadgeObject, [code]: data });
  }

  async function addCode() {
    if (code.length != 6) {
      setErrorCode("Der Code muss 6 Stellen haben!");
      return false;
    }
    if (code in codeBadgeObject) {
      setErrorCode("Der Code ist bereits vorhanden!");
      return false;
    }
    const data = await CodeToBadge(code);
    if (!data) {
      setErrorCode("Der Code konnte nicht überprüft werden!");
      return false;
    }
    if (data == "ungültig") {
      setErrorCode("Der Code ist ungültig!");
      return false;
    }
    setCode("");
    setCodeBadgeObject({ ...codeBadgeObject, [code]: data });
  }

  async function removeCode(e) {
    // This is some weird shit, but it somehow works. Thank you javascript .-.
    let code = e.target.parentElement.getAttribute("code");
    if (code == null) {
      e.target.parentElement.parentElement.getAttribute("code");
    }
    if (code == null) {
      e.target.getAttribute("code");
    }

    const newCodeBadgeObject = { ...codeBadgeObject };
    delete newCodeBadgeObject[code];
    setCodeBadgeObject(newCodeBadgeObject);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const status = await registerUser(formData, badgeList, setError);
    if (!status) {
      return false;
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
    });

    if (error) {
      setError("Es gab einen Fehler bei der Anmeldung!");
      return false;
    }

    console.log(data);
    router.push("/");
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="mt-8">
      <p className="text mb-3">
        Gib weitere Codes an, um Badges zu erhalten!
        <br /> Badges können jederzeit im Profil hinzugefügt werden.
      </p>
      <div className="flex justify-between w-full items-end">
        <div className="w-full">
          <label
            className={
              "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
              (errorCode != "" ? " bg-error opacity-50" : " bg-primary ")
            }
            htmlFor="code"
          >
            Code
          </label>
          {errorCode != "" && (
            <div className="bg-error rounded-t-div px-3 py-2 text-text text text-sm">
              {errorCode}
            </div>
          )}
          <input
            className={
              "input w-full" +
              (errorCode != ""
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
            "rounded-button text-text text-sm ms-4 h-[42px] border-[3px] border-primary " +
            (buttonDisabled
              ? " btn-secondary pointer-events-none cursor-default"
              : " btn-primary")
          }
          type="button"
          onClick={addCode}
        >
          Hinzufügen
        </button>
      </div>
      <span className="text text-sm mt-2 ms-1.5 text-muted">
        6-Stelliger Code (Optional)
      </span>
      {Object.keys(codeBadgeObject).length != 0 && (
        <div className="flex mt-3">
          <div className="flex flex-wrap gap-4">
            {Object.keys(codeBadgeObject).map((key) => {
              const item = codeBadgeObject[key];

              // This array defines the badge id's that are not permitted to be removed
              const badgesForUsers = [1, 2, 6];
              return (
                <div
                  className={
                    "px-5 py-1 rounded-badge flex items-center " + item.class
                  }
                  key={item.id_badge}
                  code={key}
                >
                  <p className="text font-bold text-sm">{item.text}</p>
                  {!badgesForUsers.includes(item.id_badge) && (
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="ms-2 text-white hover:cursor-pointer"
                      onClick={(e) => removeCode(e)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex justify-between mt-20">
        <button
          className="btn-secondary text text-sm"
          onClick={() => setPage(4)}
        >
          Zurück
        </button>
        <button className="btn-primary text text-sm" type="submit">
          Abschliessen
        </button>
      </div>
      <div className="w-full">
        {error != "" && (
          <div className="bg-error mt-3 rounded-div px-3 py-2 text-text text text-sm">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
