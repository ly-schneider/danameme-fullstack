"use client";

import supabase from "@/components/supabase";
import { useEffect, useState } from "react";

export default function SettingsPage({ params }) {
  const [profile, setProfile] = useState({});
  const [account, setAccount] = useState({});

  const [success, setSuccess] = useState("");

  const [profileGotFound, setProfileGotFound] = useState(true);

  useEffect(() => {
    async function loadData() {
      const profile = await getProfile();
      console.log(profile);
      setProfile(profile);

      if (profile == false) {
        setProfileGotFound(false);
        return false;
      }

      const account = await getAccount(profile.account_id);
      console.log(account);
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

  return (
    <div>
      <h1>Settings</h1>
    </div>
  );
}
