"use client";

import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";
import supabase from "../supabase";
import { useEffect, useState } from "react";

export default function NotificationButton({ id_profile }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);

  function handleClick() {
    router.push("/notification/");
  }

  useEffect(() => {
    getNotifications(id_profile);
  }, []);

  async function getNotifications(id_profile) {
    const { data, error } = await supabase
      .from("notification")
      .select("id_notification")
      .neq("seen", true)
      .eq("toprofile_id", id_profile);

    if (error) {
      console.log(error);
      return false;
    }

    setNotifications(data);
  }

  async function updateNotifications(payload) {
    const { data, error } = await supabase
      .from("notification")
      .select("id_notification")
      .neq("seen", true)
      .eq("toprofile_id", id_profile);

    if (error) {
      console.log(error);
      return false;
    }

    setNotifications(data);
  }

  supabase
    .channel("navigation-notification")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notification" },
      updateNotifications
    )
    .subscribe();

  return (
    <>
      <Tooltip
        content="Mitteilungen"
        className="text-sm font-medium text-white bg-zinc-800 !mt-2"
      >
        <button
          onClick={handleClick}
          className="relative text-background py-1 px-[9px] sm:py-2 sm:px-[13px] rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500 bg-text"
        >
          <FontAwesomeIcon icon={faBell} />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
              {notifications.length}
            </span>
          )}
        </button>
      </Tooltip>
    </>
  );
}
