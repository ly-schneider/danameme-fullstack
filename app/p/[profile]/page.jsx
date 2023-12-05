"use client";

import supabase from "@/components/supabase";
import { useEffect, useState } from "react";

export default function ProfilePage({ params }) {
  const [profile, setProfile] = useState({});
  const [badges, setBadges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [joined, setJoined] = useState("");

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

      const badges = await getBadges(profile);
      console.log(badges);
      setBadges(badges);

      const joined = await getJoined(profile);
      console.log(joined);
      setJoined(joined);
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

  async function getBadges(profile) {
    const { data, error } = await supabase
      .from("profile_badge")
      .select("badge_id")
      .eq("profile_id", profile.id_profile);

    if (error) {
      console.log(error);
      return false;
    }

    const badgesTemp = {};

    const badgePromises = data.map(async (badge) => {
      const { data, error } = await supabase
        .from("badge")
        .select("text, class")
        .eq("id_badge", badge.badge_id);

      if (error) {
        console.log(error);
        return false;
      }

      badgesTemp[badge.badge_id] = data[0];
    });

    await Promise.all(badgePromises);

    let sortedArrray = [];

    Object.keys(badgesTemp)
      .sort()
      .reverse()
      .forEach((key) => {
        console.log(key);
        sortedArrray.push({
          key: key,
          class: badgesTemp[key].class,
          text: badgesTemp[key].text,
        });
      });

    console.log(sortedArrray);

    return sortedArrray;
  }

  async function getJoined(profile) {
    const { data, error } = await supabase
      .from("account")
      .select("createdat")
      .eq("id_account", profile.account_id);

    if (error) {
      console.log(error);
      return false;
    }

    const date = new Date(data[0].createdat);
    const dateStringCustom = `${date.toLocaleDateString("de-DE", {
      day: "numeric",
    })}. ${date.toLocaleDateString("de-DE", {
      month: "long",
    })} ${date.toLocaleDateString("de-DE", { year: "numeric" })}, ${
      date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
    }:${
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
    } Uhr`;

    return dateStringCustom;
  }

  return (
    <>
      {profileGotFound ? (
        <div>
          <div className="flex items-center">
            <img
              src={profile.profileimage}
              className="rounded-full border-[5px] border-accent h-24 w-24"
            />
            <h1 className="text-text font-bold text-3xl font-poppins ms-4">
              {profile.username}
            </h1>
          </div>
          <div className="w-full mt-3">
            <p className="text-muted text text-sm">Beigetreten {joined}</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {Object.keys(badges).map((badge) => {
              const item = badges[badge];
              let text = item.text;
              if (text == null) {
                text = "#" + profile.userCount;
              }
              return (
                <div
                  className={item.class + " px-5 py-1.5 rounded-badge"}
                  key={item.key}
                >
                  <p className="text-text text text-sm">{text}</p>
                </div>
              );
            })}
          </div>
          <p className="text mt-3 font-semibold">{profile.biography}</p>
          <hr className="seperator mt-8" />
        </div>
      ) : (
        <div className="flex justify-center mt-8">
          <h1 className="title text-2xl">
            Profil konnte nicht gefunden werden!
          </h1>
        </div>
      )}
    </>
  );
}
