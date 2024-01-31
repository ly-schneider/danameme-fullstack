"use client";

import { checkBan } from "@/components/auth/checkBan";
import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import { calcTime } from "@/components/other/calcTime";
import supabase from "@/components/supabase";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FollowerPage({ params }) {
  const router = useRouter();

  const [profile, setProfile] = useState([]);
  const [followers, setFollowers] = useState([]);

  const [profileGotFound, setProfileGotFound] = useState(false);

  const [banned, setBanned] = useState(false);
  const [banData, setBanData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const session = await getSession();
      if (session == false) {
        return false;
      }

      const accountSession = await getAccount(session.session.user.email);
      if (accountSession == false) {
        return false;
      }

      const profileSession = await getProfile(accountSession.id_account);
      if (profileSession == false) {
        return false;
      }

      const banData = await checkBan(accountSession.id_account);
      let banCond = false;
      if (banData.length > 0) {
        banData.forEach((ban) => {
          if (ban.type == "account") {
            setBanned(true);
            setBanData(ban);
            banCond = true;
          }
        });
      }

      if (banCond) {
        return false;
      }

      const profile = await getUserProfile();
      setProfile(profile);

      if (profile == false) {
        setProfileGotFound(false);
        return false;
      }

      const followers = await getFollowers(profile.id_profile);
      setFollowers(followers);

      setProfileGotFound(true);
    }
    loadData();
  }, []);

  async function getUserProfile() {
    const { data, error } = await supabase
      .from("profile")
      .select("profileimage, username, confirmed, id_profile")
      .eq("username", params.profile)
      .single();

    if (error) {
      console.log(error);
      return false;
    }

    return data;
  }

  async function getFollowers(id_profile) {
    const { data, error } = await supabase
      .from("follower")
      .select(
        "id_follower, profile_id, follower_id, profile:follower_id (id_profile, username, profileimage)"
      )
      .eq("profile_id", id_profile);

    if (error) {
      console.log(error);
      return false;
    }

    return data;
  }

  return (
    <>
      {profileGotFound ? (
        <div className="mx-6 sm:mx-0 mt-4">
          <button
            className="btn-secondary items-center flex"
            onClick={() => router.back()}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text text-sm me-2" />
            Zurück
          </button>
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <img
                src={profile.profileimage}
                className="rounded-full border-[5px] border-accent h-24 w-24 object-cover"
              />
              <h1 className="text-text font-bold text-3xl font-poppins ms-4">
                {profile.username}
              </h1>
              <span className="ms-3 text-muted text">
                {profile.confirmed != true && <>(Unverifiziert)</>}
              </span>
            </div>
          </div>
          <div className="flex items-center w-full mt-4">
            <div className="flex items-center">
              <h1 className="title text-3xl">Followers</h1>
            </div>
          </div>
          <hr className="seperator mt-3" />
          <div className="flex flex-col mt-4 space-y-4">
            {followers.map((user) => (
              <div key={user.id_profile}>
                <Link href={`/p/${user.profile.username}`}>
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row items-center space-x-2">
                      <img
                        src={user.profile.profileimage}
                        className="w-10 h-10 rounded-full object-cover border-2 border-accent"
                        alt="avatar"
                      />
                      <div className="flex flex-col">
                        <p className="font-semibold text text-lg">
                          {user.profile.username}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {banned ? (
            <div className="flex flex-col items-center w-full mt-8">
              <h1 className="title font-extrabold text-error">Banned!</h1>
              <h1 className="title text-lg font-extrabold text-error">
                Bis: {calcTime(banData.until)}
              </h1>
              <p className="text text-base text-center mt-3">
                Grund dafür ist: {banData.reason}
              </p>
              <p className="text text-sm text-muted text-center mt-3">
                Du wurdest von {banData.bannedby} am{" "}
                {calcTime(banData.createdat)} gebannt.
              </p>
            </div>
          ) : (
            <div className="mx-6 sm:mx-0 mt-3">
              <div className="flex flex-row justify-start items-center">
                <hr className="border-[20px] border-zinc-700 w-32 rounded-md animate-pulse" />
              </div>
              <div className="flex flex-row items-center justify-start mt-5">
                <div className="flex items-center">
                  <div className="rounded-full bg-zinc-700 w-24 h-24 flex items-center justify-center animate-pulse"></div>
                  <hr className="border-[10px] border-zinc-700 ml-3 w-52 rounded-md animate-pulse" />
                </div>
              </div>
              <div className="w-full mt-6">
                <hr className="border-[12px] border-zinc-700 w-32 rounded-md animate-pulse" />
              </div>
              <div className="w-full mt-4">
                <hr className="border-[2px] border-zinc-700 w-full animate-pulse" />
              </div>
              <div className="flex flex-row items-center justify-start mt-5">
                <div className="flex items-center">
                  <div className="rounded-full bg-zinc-700 w-10 h-10 flex items-center justify-center animate-pulse"></div>
                  <hr className="border-4 border-zinc-700 ml-3 w-52 rounded-md animate-pulse" />
                </div>
              </div>
              <div className="flex flex-row items-center justify-start mt-5">
                <div className="flex items-center">
                  <div className="rounded-full bg-zinc-700 w-10 h-10 flex items-center justify-center animate-pulse"></div>
                  <hr className="border-4 border-zinc-700 ml-3 w-52 rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
