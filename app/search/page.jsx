"use client";

import { checkBan } from "@/components/auth/checkBan";
import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import { calcTime } from "@/components/other/calcTime";
import calcTimeShort from "@/components/other/calcTimeShort";
import { generateTitle } from "@/components/post/generateTitle";
import supabase from "@/components/supabase";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotificationPage() {
  const router = useRouter();

  const [profiles, setProfiles] = useState([]);

  const [banned, setBanned] = useState(false);
  const [banData, setBanData] = useState(null);

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            const banData = await checkBan(account.id_account);
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
          }
        }
      } else {
        router.push("/login");
      }
    }
    getData();
  }, []);

  async function getProfiles(query) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profile")
      .select("id_profile, username, profileimage")
      .like("username", `%${query}%`)

    if (profilesError) {
      console.log(profilesError);
      return false;
    }

    setProfiles(profiles);
  }

  return (
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
            Du wurdest von {banData.bannedby} am {calcTime(banData.createdat)}{" "}
            gebannt.
          </p>
        </div>
      ) : (
        <div className="mt-8 mx-5 sm:mx-0">
          <h1 className="title ">Suchen</h1>
          <form className="mt-4">
            <div>
              <label
                className={
                  "text text-sm ms-1.5 px-3 py-1 rounded-t-form bg-primary"
                }
                htmlFor="search"
              >
                Suche nach Profilen
              </label>
              <input
                className={
                  "input w-full"
                }
                type="text"
                id="search"
                autoComplete="off"
                onChange={(e) => {
                  getProfiles(e.target.value);
                }}
              />
            </div>
          </form>
          <div className="flex flex-col mt-4 space-y-4">
            {profiles.map((user) => (
              <div key={user.id_profile}>
                <Link href={`/p/${user.username}`}>
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row items-center space-x-2">
                      <img
                        src={user.profileimage}
                        className="w-10 h-10 rounded-full object-cover border-2 border-accent"
                        alt="avatar"
                      />
                      <div className="flex flex-col">
                        <p className="font-semibold text text-lg">
                          {user.username}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
