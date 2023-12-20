import { useEffect, useState } from "react";
import supabase from "../supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { getSession } from "../auth/getSession";
import deleteAccountAuth from "../auth/deleteAccountAuth";
import { useRouter } from "next/navigation";

export default function AccountSettings({ account }) {
  const router = useRouter();
  const [email, setEmail] = useState(account.email);
  const [errorEmail, setErrorEmail] = useState("");

  const [errorPassword, setErrorPassword] = useState("");
  const [successPassword, setSuccessPassword] = useState("");

  const [firstname, setFirstname] = useState(account.firstname);
  const [firstnameError, setFirstnameError] = useState("");
  const [firstnameSuccess, setFirstnameSuccess] = useState("");

  const [lastname, setLastname] = useState(account.lastname);
  const [lastnameError, setLastnameError] = useState("");
  const [lastnameSuccess, setLastnameSuccess] = useState("");

  const [deleteAccount, setDeleteAccount] = useState(false);
  const [accountDeleteEmail, setAccountDeleteEmail] = useState("");
  const [deleteAccountError, setDeleteAccountError] = useState("");

  const [session, setSession] = useState(null);

  useEffect(() => {
    setEmail(account.email);
    setFirstname(account.firstname);
    setLastname(account.lastname);

    async function getData() {
      const status = await getSession();
      if (status) {
        setSession(status);
        console.log(status);
      }
    }
    getData();
  }, [account]);

  async function handleUpdateEmail() {
    if (email == account.email) {
      return false;
    }

    const checkEmailStatus = await checkEmail();
    if (checkEmailStatus == false) {
      return false;
    }

    // const { data, error } = await supabase
    //   .from("account")
    //   .update({ email: email })
    //   .eq("id_account", account.id_account);

    // if (error) {
    //   setErrorEmail("Ein Fehler ist aufgetreten.");
    //   return false;
    // }

    let redirectUrl = window.location.hostname;
    if (redirectUrl == "localhost") {
      redirectUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        "/p/" +
        account.username +
        "/settings/";
    } else {
      redirectUrl = redirectUrl + "/p/" + account.username + "/settings/";
    }

    const { data: updateUser, error: updateUserError } =
      await supabase.auth.updateUser({
        email: email,
        options: {
          emailRedirectTo: "http://localhost:3000/update-password/",
        },
      });

    if (updateUserError) {
      setErrorEmail("Ein Fehler ist aufgetreten.");
      return false;
    }

    setErrorEmail(
      "Bitte schaue in dein E-Mail Postfach zum die Änderung zu bestätigen. Überprüfe auch deinen Spam-Ordner."
    );
  }

  async function checkEmail() {
    const { data, error } = await supabase
      .from("account")
      .select("*")
      .eq("email", email);

    if (error) {
      setErrorEmail("Ein Fehler ist aufgetreten.");
      return false;
    }

    if (data.length != 0) {
      setErrorEmail("Diese E-Mail wird bereits verwendet.");
      return false;
    }

    return true;
  }

  async function handleUpdatePassword() {
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
      redirectTo: "http://localhost:3000/p/lyschneider/settings/",
    });

    if (error) {
      setErrorPassword("Ein Fehler ist aufgetreten.");
      return false;
    }

    setSuccessPassword(
      "Ein Link wurde an deine E-Mail Adresse gesendet für das Zurücksetzten des Passworts."
    );
  }

  async function handleFirstnameChange() {
    if (firstname == account.firstname) {
      return false;
    }

    const { data, error } = await supabase
      .from("account")
      .update({ firstname: firstname })
      .eq("id_account", account.id_account);

    if (error) {
      setFirstnameError("Ein Fehler ist aufgetreten.");
      return false;
    }

    setFirstnameSuccess("Vorname wurde aktualisiert.");
  }

  async function handleLastnameChange() {
    if (lastname == account.lastname) {
      return false;
    }

    const { data, error } = await supabase
      .from("account")
      .update({ lastname: lastname })
      .eq("id_account", account.id_account);

    if (error) {
      setLastnameError("Ein Fehler ist aufgetreten.");
      return false;
    }

    setLastnameSuccess("Nachname wurde aktualisiert.");
  }

  async function handleAccountDelete() {
    if (accountDeleteEmail != email) {
      return false;
    }

    const { data, error } = await supabase
      .from("account")
      .delete()
      .eq("id_account", account.id_account);

    if (error) {
      setDeleteAccountError("Ein Fehler ist aufgetreten.");
      return false;
    }

    const status = await deleteAccountAuth(session.session.user.id);

    if (status == false) {
      setDeleteAccountError("Ein Fehler ist aufgetreten.");
      return false;
    }

    router.push("/login");
  }

  return (
    <div className="flex flex-col items-center w-full text">
      <div className="flex flex-col w-full mt-8">
        {errorEmail != "" && (
          <div className="bg-error font-bold my-2 rounded-div px-3 py-2 text-text text text-sm flex flex-row justify-between items-center">
            <span>{errorEmail}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setErrorEmail("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center mb-4">
          <h1 className="title text-lg font-semibold w-full sm:w-1/4">
            E-Mail
          </h1>
          <div className="flex justify-between sm:justify-end space-x-3 w-full sm:w-3/4 mt-3 sm:mt-0">
            <input
              type="email"
              className="input text text-sm px-8 w-full text-center"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <button
              className={
                email == account.email
                  ? " btn-secondary text-muted pointer-events-none hover:cursor-default"
                  : " btn-primary"
              }
              onClick={handleUpdateEmail}
            >
              Aktualisieren
            </button>
          </div>
        </div>
        {errorPassword != "" && (
          <div className="bg-success font-bold mt-2 mb-2 rounded-div px-3 py-2 text-background text text-sm flex flex-row justify-between items-center">
            <span>{errorPassword}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setErrorPassword("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        {successPassword != "" && (
          <div className="bg-success font-bold mt-2 mb-2 rounded-div px-3 py-2 text-background text text-sm flex flex-row justify-between items-center">
            <span>{successPassword}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setSuccessPassword("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        <div className="flex flex-row items-center">
          <h1 className="title text-lg font-semibold w-1/4">Passwort</h1>
          <div className="flex justify-end space-x-3 w-3/4">
            <button
              className={"btn-primary w-auto"}
              onClick={handleUpdatePassword}
            >
              Passwort zurücksetzen
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full mt-8 border-y-2 border-muted py-8">
        {firstnameError != "" && (
          <div className="bg-error font-bold my-2 rounded-div px-3 py-2 text-text text text-sm flex flex-row justify-between items-center">
            <span>{firstnameError}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setFirstnameError("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        {firstnameSuccess != "" && (
          <div className="bg-success font-bold mt-2 mb-2 rounded-div px-3 py-2 text-background text text-sm flex flex-row justify-between items-center">
            <span>{firstnameSuccess}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setFirstnameSuccess("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center mb-4">
          <h1 className="title text-lg font-semibold w-full sm:w-1/4">
            Vorname
          </h1>
          <div className="flex justify-between sm:justify-end space-x-3 w-full sm:w-3/4 mt-3 sm:mt-0">
            <input
              type="text"
              className="input text text-sm px-8 w-full text-center"
              onChange={(e) => setFirstname(e.target.value)}
              value={firstname}
            />
            <button
              className={
                firstname == account.firstname
                  ? " btn-secondary text-muted pointer-events-none hover:cursor-default"
                  : " btn-primary"
              }
              onClick={() => handleFirstnameChange()}
            >
              Aktualisieren
            </button>
          </div>
        </div>
        {lastnameError != "" && (
          <div className="bg-error font-bold my-2 rounded-div px-3 py-2 text-text text text-sm flex flex-row justify-between items-center">
            <span>{lastnameError}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setLastnameError("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        {lastnameSuccess != "" && (
          <div className="bg-success font-bold mt-2 mb-2 rounded-div px-3 py-2 text-background text text-sm flex flex-row justify-between items-center">
            <span>{lastnameSuccess}</span>
            <FontAwesomeIcon
              icon={faXmark}
              onClick={() => setLastnameSuccess("")}
              className="hover:cursor-pointer"
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center">
          <h1 className="title text-lg font-semibold w-full sm:w-1/4">
            Nachname
          </h1>
          <div className="flex justify-between sm:justify-end space-x-3 w-full sm:w-3/4 mt-3 sm:mt-0">
            <input
              type="text"
              className="input text text-sm px-8 w-full text-center"
              onChange={(e) => setLastname(e.target.value)}
              value={lastname}
            />
            <button
              className={
                lastname == account.lastname
                  ? " btn-secondary text-muted pointer-events-none hover:cursor-default"
                  : " btn-primary"
              }
              onClick={() => handleLastnameChange()}
            >
              Aktualisieren
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-row w-full justify-end mt-8">
        <button
          className="btn-secondary border-error text-muted hover:btn-primary hover:bg-error hover:border-error hover:text-text transition-all duration-300"
          onClick={() => {
            setDeleteAccount(!deleteAccount);
            setAccountDeleteEmail("");
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} className="me-1.5" />
          Account löschen
        </button>
      </div>
      {deleteAccount && (
        <div className="flex flex-col w-full mt-8 px-28">
          <h1 className="title text-xl font-semibold text-center text-error">
            Account löschen
          </h1>
          <div>
            {deleteAccountError != "" && (
              <div className="bg-error font-bold my-2 rounded-div px-3 py-2 text-text text text-sm flex flex-row justify-between items-center">
                <span>{deleteAccountError}</span>
                <FontAwesomeIcon
                  icon={faXmark}
                  onClick={() => setFirstnameError("")}
                  className="hover:cursor-pointer"
                />
              </div>
            )}
            <p className="text-sm text-error mt-3">
              Gibe <span className="font-bold">{account.email}</span> ein um den
              Account zu löschen.
            </p>
            <p className="text-sm text-error mt-3">
              Dieser Vorgang kann nicht rückgängig gemacht werden.
            </p>
            <input
              type="email"
              className="input text text-sm w-full text-text mt-2 border-error"
              onChange={(e) => setAccountDeleteEmail(e.target.value)}
            />
            <div className="flex flex-row justify-between items-center mt-2 space-x-4">
              <button
                onClick={() => {
                  setDeleteAccount(!deleteAccount);
                  setAccountDeleteEmail("");
                }}
                className={
                  "w-full mt-4 border-[3px] btn-primary bg-error border-error text-text"
                }
              >
                Abbrechen
              </button>
              <button
                onClick={handleAccountDelete}
                className={
                  "w-full mt-4 border-[3px] transition-all duration-300" +
                  (accountDeleteEmail == email
                    ? " btn-primary bg-error border-error text-text"
                    : " btn-secondary border-error text-muted pointer-events-none hover:cursor-default")
                }
              >
                Account löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
