"use client";

import { checkBan } from "@/components/auth/checkBan";
import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import { calcTime } from "@/components/other/calcTime";
import supabase from "@/components/supabase";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotificationPage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [banned, setBanned] = useState(false);
  const [banData, setBanData] = useState(null);

  const [notifications, setNotifications] = useState([]);

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
            if (!banCond) {
              setProfile(profile);
              const data = await getNotifications(profile.id_profile);
              console.log(data);
              if (data) {
                setNotifications(data);
              }
            }
          }
        }
      } else {
        router.push("/login");
      }
    }
    getData();
  }, []);

  async function getNotifications(id) {
    const { data, error } = await supabase
      .from("notification")
      .select(
        "id_notification, createdat, fromprofile_id ( username, profileimage ), seen, text, toprofile_id"
      )
      .eq("toprofile_id", id)
      .neq("seen", true)
      .order("createdat", { ascending: false });

    if (error) {
      console.log(error);
      return false;
    }

    return data;
  }

  async function handleNewProfiles(payload) {
    console.log(payload);
    getUsers();
  }

  supabase
    .channel("users-new-profiles")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profile" },
      handleNewProfiles
    )
    .subscribe();

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
          <h1 className="title ">Mitteilungen</h1>
          <div className="mt-5">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id_notification}
                  className="flex flex-col border-b border-gray-200 py-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <img
                        src={notification.fromprofile_id.profileimage}
                        className="rounded-full border-[3px] border-accent h-12 w-12 object-cover"
                      />

                      <h1 className="text-text font-bold text-xl font-poppins ms-2 sm:ms-2">
                        {notification.fromprofile_id.username}
                      </h1>
                    </div>
                    <div className="flex items-center">
                      <button className="ml-3">
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text text-base">{notification.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-[50vh]">
                <h1 className="text text-lg font-medium">Keine Mitteilungen</h1>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
