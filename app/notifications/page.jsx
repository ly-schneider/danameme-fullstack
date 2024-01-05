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
              if (data) {
                setNotifications(data);
              }

              data.forEach(async (notification) => {
                const { data: seenData, error } = await supabase
                  .from("notification")
                  .update({ seen: true })
                  .eq("id_notification", notification.id_notification);

                if (error) {
                  console.log(error);
                  return false;
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

  async function getNotifications(id) {
    const { data, error } = await supabase
      .from("notification")
      .select(
        "id_notification, createdat, fromprofile_id ( username, profileimage ), seen, text, toprofile_id, post_id ( id_post, title, content, asset ), comment_id ( id_comment, text, post_id ( id_post, title ) )"
      )
      .eq("toprofile_id", id)
      .order("createdat", { ascending: false });

    if (error) {
      console.log(error);
      return false;
    }

    return data;
  }

  async function handleRemoveNotification(id) {
    const { data, error } = await supabase
      .from("notification")
      .delete()
      .eq("id_notification", id);

    if (error) {
      console.log(error);
      return false;
    }

    setNotifications(
      notifications.filter((notification) => notification.id_notification != id)
    );
  }

  async function removeAllNotifications() {
    const { data, error } = await supabase
      .from("notification")
      .delete()
      .eq("toprofile_id", profile.id_profile);

    if (error) {
      console.log(error);
      return false;
    }

    setNotifications([]);
  }

  async function loadNewNotifications() {
    const data = await getNotifications(profile.id_profile);
    setNotifications(data);
  }

  supabase
    .channel("notifications-new")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notification" },
      loadNewNotifications
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
          <div className="mt-5 w-full">
            {notifications.length > 0 ? (
              <>
                <div className="flex justify-end items-center">
                  <button
                    className="btn btn-primary text text-xs bg-muted rounded-md mb-2"
                    onClick={removeAllNotifications}
                  >
                    Alle entfernen
                  </button>
                </div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id_notification}
                    className="flex flex-col py-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                          <img
                            src={notification.fromprofile_id.profileimage}
                            className="rounded-full border-[3px] border-accent h-12 w-12 object-cover"
                          />
                          <div className="ml-3">
                            <p className="text">
                              <Link
                                href={`/p/${notification.fromprofile_id.username}`}
                                passHref
                              >
                                <span className="font-semibold">
                                  {notification.fromprofile_id.username}
                                </span>{" "}
                              </Link>
                              {notification.text}
                              {notification.post_id && (
                                <>
                                  {!notification.post_id.asset &&
                                  notification.post_id.title ? (
                                    <Link
                                      href={
                                        "/post/" +
                                        generateTitle(notification.post_id)
                                      }
                                      className="font-semibold"
                                    >
                                      : {notification.post_id.title}
                                    </Link>
                                  ) : (
                                    <>
                                      {!notification.post_id.asset && (
                                        <Link
                                          href={
                                            "/post/" +
                                            generateTitle(notification.post_id)
                                          }
                                          className="font-semibold"
                                        >
                                          : {notification.post_id.content}
                                        </Link>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                              {notification.comment_id && (
                                <>
                                  <Link
                                    href={
                                      "/post/" +
                                      generateTitle(
                                        notification.comment_id.post_id
                                      )
                                    }
                                    className="font-semibold"
                                  >
                                    : {notification.comment_id.text}
                                  </Link>
                                </>
                              )}
                              <span className="text-muted text-sm">
                                {" "}
                                {calcTimeShort(notification.createdat)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {notification.post_id && (
                            <>
                              {notification.post_id.asset && (
                                <Link
                                  href={
                                    "/post/" +
                                    generateTitle(notification.post_id)
                                  }
                                >
                                  <img
                                    src={notification.post_id.asset}
                                    className="rounded-sm h-10 w-10"
                                  />
                                </Link>
                              )}
                            </>
                          )}
                          <button
                            className="ml-3 text-text"
                            onClick={() =>
                              handleRemoveNotification(
                                notification.id_notification
                              )
                            }
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center w-full mt-8">
                <h1 className="text text-muted text-base font-bold">
                  Keine Mitteilungen
                </h1>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
