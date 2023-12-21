"use client";

import {
  faGear,
  faMoon,
  faRightToBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown, ToggleSwitch, Tooltip } from "flowbite-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "../auth/getSession";
import { getAccount } from "../auth/getAccount";
import { getProfile } from "../auth/getProfile";
import supabase from "../supabase";

export default function ProfileButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            setProfile(profile);
          }
        }
      }
    }
    getData();
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log(error);
    } else {
      location.href = "/login";
    }
  }

  async function handleDarkmode() {
    alert(
      "Wolltest du ernsthaft den Whitemode aktivieren? Dein Account wird jetzt gelöscht!"
    );
    alert("War nur Spass! (Trotzdem cringe von dir)");
  }

  return (
    <>
      <div className="[&>div]:bg-background [&>div]:border-[3px] [&>div]:border-primary [&>div]:rounded-md">
        <Dropdown
          renderTrigger={() => (
            <button
              className={`text-background py-[4.5px] px-[9px] sm:py-2 sm:px-[13px] rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500 ${
                pathname == "/p/" + profile.username ? "bg-accent" : "bg-text"
              }`}
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
          )}
          label=""
          className="text-sm font-medium text-white bg-zinc-800 !mt-2"
        >
          <Dropdown.Item
            className="text text-sm text-text font-extrabold hover:bg-accentBackground"
            onClick={() => router.push("/p/" + profile.username)}
          >
            <img
              src={profile.profileimage}
              className="w-8 h-8 rounded-image border-2 border-accent me-1.5 object-cover"
            />
            {profile.username}
          </Dropdown.Item>
          <Dropdown.Item
            className="text text-sm hover:bg-accentBackground"
            onClick={() => router.push("/p/" + profile.username + "/settings")}
          >
            <FontAwesomeIcon icon={faGear} className="me-1.5" />
            Einstellungen
          </Dropdown.Item>
          <Dropdown.Item
            className="text text-sm hover:bg-accentBackground"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faRightToBracket} className="me-1.5" />
            Logout
          </Dropdown.Item>
          <Dropdown.Item
            className="text text-sm hover:bg-accentBackground border-t border-muted"
            onClick={handleDarkmode}
          >
            <FontAwesomeIcon icon={faMoon} className="me-1.5" />
            Darkmode
          </Dropdown.Item>
        </Dropdown>
      </div>
    </>
  );
}
