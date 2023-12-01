import { useEffect, useState } from "react";
import supabase from "./supabase";
import { useRouter } from "next/navigation";
import { ValidateRegistration, CheckCode } from "./validate";

export default function Login() {
  const router = useRouter();

  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirm] = useState();
  const [firstname, setFirstname] = useState();
  const [lastname, setLastname] = useState();
  const [code, setCode] = useState();
  const [username, setUsername] = useState();

  const [errorLogin, setErrorLogin] = useState([]);
  const [error, setError] = useState([]);

  useEffect(() => {
    document.title = "Authenticate | DANAMEME";
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    console.log("Login");

    if (emailLogin == "") {
      setError((error) => [...error, "E-Mail muss angegeben werden"]);
    }
    if (passwordLogin == "") {
      setError((error) => [...error, "Passwort muss angegeben werden"]);
    }

    console.log("No errors");
    loginUser();
  }

  async function loginUser() {
    const { user, error } = await supabase.auth.signInWithPassword({
      email: emailLogin,
      password: passwordLogin,
    });
    if (error) {
      console.log(error);
      if (error.status == 400) {
        setError((error) => [...error, "E-Mail oder Passwort falsch"]);
        return;
      }
      setError((error) => [...error, error.message]);
      return;
    }

    console.log(user);
    getSession();
  }

  async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log(error);
      setError((error) => [...error, error.message]);
      return;
    }

    console.log(data);
    getUserDataWithEmail(data.session.user.email);
  }

  async function getUserDataWithEmail(email) {
    const { data, error } = await supabase
      .from("account")
      .select("id_account")
      .eq("email", email);
    if (error) {
      console.log(error);
      setError((error) => [...error, error.message]);
      return;
    }

    getProfileDataWithID(data[0].id_account);
    console.log(data);
  }

  async function getProfileDataWithID(id) {
    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("account_id", id);
    if (error) {
      console.log(error);
      setError((error) => [...error, error.message]);
      localStorage.clear();
      return;
    }

    console.log(data);
    localStorage.setItem("profile", JSON.stringify(data[0]));
    location.reload();
  }

  async function handleRegister(e) {
    e.preventDefault();

    const validation = ValidateRegistration(
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      code
    );
    if (validation != true) {
      console.log(validation);
      validation.forEach((err) => {
        setError((error) => [...error, err]);
      });
      return false;
    }
    const codeValidation = await CheckCode(code);
    console.log(codeValidation);
    if (codeValidation == false) {
      setError((error) => [...error, "Code ist falsch"]);
      return false;
    }
    signUpUser(codeValidation);
    console.log("Register");
  }

  async function signUpUser(codeValidation) {
    const { user, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (error) {
      console.log(error);
      setError((error) => [...error, error.message]);
      return;
    }
    
    console.log(user);
    // createAccount(codeValidation);
  }

  async function createAccount(codeValidation) {
    const { error: insertError } = await supabase.from("account").insert({
      firstname: firstname,
      lastname: lastname,
      email: email,
    });

    if (insertError) {
      console.log(insertError);
      setError((error) => [...error, insertError.message]);
      return false;
    }

    const { data: accountData, error: selectError } = await supabase
      .from("account")
      .select("*")
      .eq("email", email)
      .single();

    if (selectError) {
      console.log(selectError);
      setError((error) => [...error, selectError.message]);
      return false;
    }

    createProfile(accountData.id_account, codeValidation);
  }

  async function createProfile(id_account, codeValidation) {
    const { data: userCountData, error: countError } = await supabase
      .from("profile")
      .select("userCount")
      .order("userCount", { ascending: false })
      .limit(1)
      .single();

    if (countError) {
      console.log(countError);
      setError((error) => [...error, countError.message]);
      return false;
    }

    const userCount = userCountData.userCount + 1;
    if(userCount<=10) {
      codeValidation.push(7); // Badge ID For Badge 1-10
    } else if(userCount > 10 && userCount <= 100) {
      codeValidation.push(8); // Badge ID For Badge 11-100
    } else if(userCount > 100 && userCount <= 200) {
      codeValidation.push(9); // Badge ID For Badge 101-1000
    }

    const { error: insertError } = await supabase.from("profile").insert({
      username: username,
      account_id: id_account,
      role_id: 1,
      userCount: userCount,
    });

    if (insertError) {
      console.log(insertError);
      setError((error) => [...error, insertError.message]);
      return false;
    }

    const { data: selectData, error: selectError } = await supabase
      .from("profile")
      .select("id_profile")
      .eq("username", username)
      .single();

    if (selectError) {
      console.log(selectError);
      setError((error) => [...error, selectError.message]);
      return false;
    }

    addBadges(selectData.id_profile, codeValidation);
  }

  async function addBadges(id_profile, codeValidation) {
    codeValidation.forEach(async (badgeId) => {
      const { error: insertError } = await supabase
        .from("profile_badge")
        .insert({
          profile_id: id_profile,
          badge_id: badgeId,
        });

      if (insertError) {
        console.log(insertError);
        setError((error) => [...error, insertError.message]);
        return false;
      }
    });

    signUpUser();
  }

  return (
    <div className="my-16">
      <div>
        <h1 className="font-montserrat font-bold text-3xl text-textPrimary text-center">
          DANAMEME kann nur angemeldet verwendet werden
        </h1>
      </div>
      <div className="flex mt-8">
        <div className="w-1/2 pe-4 border-r-2 border-white">
          <h1 className="font-montserrat font-semibold text-xl text-textPrimary">
            Anmelden
          </h1>
          <hr className="border-[1.5px] border-white mt-1"></hr>
          <form onSubmit={(e) => handleLogin(e)}>
            <input
              type="email"
              placeholder="E-Mail"
              id="emailLogin"
              onChange={(e) => setEmailLogin(e.target.value)}
              className="text-xs w-full mt-6 py-3 px-3 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
            ></input>
            <input
              type="password"
              placeholder="Passwort"
              id="passwordLogin"
              onChange={(e) => setPasswordLogin(e.target.value)}
              className="text-xs w-full mt-2 py-3 px-3 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
            ></input>
            <div className="w-full mt-4">
              <a
                href="/forgot"
                className="text-xs mt-2 text-textPrimary underline w-full"
              >
                Passwort vergessen?
              </a>
            </div>
            {errorLogin.length > 0 && (
              <div className="w-full mt-3 mb-1">
                {errorLogin.map((err, index) => (
                  <p className="text-xs mt-2 text-red-500 w-full" key={index}>
                    {err}
                  </p>
                ))}
              </div>
            )}
            <button
              type="submit"
              className="text-xs w-auto mt-2 py-3 px-10 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
            >
              Anmelden
            </button>
          </form>
        </div>
        <div className="w-1/2 ms-4">
          <h1 className="font-montserrat font-semibold text-xl text-textPrimary">
            Registrieren
          </h1>
          <hr className="border-[1.5px] border-white mt-1"></hr>
          <form onSubmit={(e) => handleRegister(e)}>
            <div className="flex justify-between space-x-3">
              <input
                type="text"
                placeholder="Vorname"
                id="firstNameRegister"
                required
                onChange={(e) => setFirstname(e.target.value)}
                className="text-xs w-1/2 mt-6 py-3 px-3 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
              ></input>
              <input
                type="text"
                placeholder="Nachname"
                id="lastNameRegister"
                required
                onChange={(e) => setLastname(e.target.value)}
                className="text-xs w-1/2 mt-6 py-3 px-3 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
              ></input>
            </div>
            <input
              type="email"
              placeholder="E-Mail"
              id="emailRegister"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs w-full mt-2 py-3 px-3 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
            ></input>
            <input
              min={6}
              type="password"
              placeholder="Passwort"
              id="passwordRegister"
              required
              onChange={(e) => setPassword(e.target.value)}
              className="text-xs w-full mt-2 py-3 px-3 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
            ></input>
            <input
              min={6}
              type="password"
              placeholder="Passwort wiederholen"
              id="confirmPasswordRegister"
              required
              onChange={(e) => setConfirm(e.target.value)}
              className="text-xs w-full mt-2 py-3 px-3 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
            ></input>
            <input
              type="text"
              placeholder="Benutzername"
              id="usernameRegister"
              required
              onChange={(e) => setUsername(e.target.value)}
              className="text-xs w-full mt-2 py-3 px-3 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
            ></input>
            <input
              max={999999}
              min={100000}
              type="number"
              placeholder="6-Stelliger Code"
              id="codeRegister"
              required
              onChange={(e) => setCode(e.target.value)}
              className="text-xs w-1/2 mt-2 py-3 px-3 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
            ></input>
            {error.length > 0 && (
              <div className="w-full mt-3 mb-1">
                {error.map((err, index) => (
                  <p className="text-xs mt-2 text-red-500 w-full" key={index}>
                    {err}
                  </p>
                ))}
              </div>
            )}
            <button
              type="submit"
              className="text-xs w-auto mt-6 py-3 px-10 rounded-[15px] bg-backgroundAccent font-montserrat font-semibold focus:outline-none border-none focus:shadow-none placeholder:text-textAccent placeholder:font-bold"
            >
              Registrieren
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
