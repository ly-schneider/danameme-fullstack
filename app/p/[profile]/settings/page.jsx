"use client";

import { getSession } from "@/components/auth/getSession";
import AccountSettings from "@/components/settings/account";
import ProfileSettings from "@/components/settings/profile";
import supabase from "@/components/supabase";
import { useEffect, useState } from "react";

export default function SettingsPage({ params }) {
  const [profile, setProfile] = useState({});
  const [account, setAccount] = useState({});

  const [error, setError] = useState(false);

  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadData() {
      const session = await getSession();
      if (!session) {
        return false;
      }

      const profile = await getProfile();
      if (profile == false) {
        return false;
      }

      const account = await getAccount(profile.account_id);
      if (session.session.user.email != account.email) {
        setError(true);
        return false;
      }
      setProfile(profile);
      setAccount(account);
    }
    loadData();
  }, []);

  async function getProfile() {
    const { data, error } = await supabase
      .from("profile")
      .select(
        "karma, profileimage, biography, userCount, username, id_profile, account_id"
      )
      .eq("username", params.profile)
      .single();

    if (error) {
      console.log(error);
      return false;
    }

    return data;
  }

  async function getAccount(id_account) {
    const { data, error } = await supabase
      .from("account")
      .select("*")
      .eq("id_account", id_account)
      .single();

    if (error) {
      console.log(error);
      return false;
    }

    return data;
  }

  function conditionalComponent() {
    switch (page) {
      case 1:
        return <AccountSettings account={account} />;
      case 2:
        return <ProfileSettings profile={profile} />;
    }
  }

  return (
    <div>
      {error ? (
        <div className="flex flex-col items-center w-full">
          <h1 className="title text-lg font-semibold">
            Du hast keine Berechtigung diese Seite zu sehen.
          </h1>
        </div>
      ) : (
        <>
          <h1 className="title text-center">Einstellungen</h1>
          <div className="flex flex-row justify-center title text-lg font-semibold space-x-32 mt-8">
            <button
              onClick={() => setPage(1)}
              className={page == 1 ? "underline" : ""}
            >
              Account
            </button>
            <button
              onClick={() => setPage(2)}
              className={page == 2 ? "underline" : ""}
            >
              Profil
            </button>
          </div>
          <hr className="w-full border-muted border mt-2"></hr>
          {conditionalComponent()}
        </>
      )}
    </div>
  );
}
