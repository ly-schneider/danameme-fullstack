"use client";

import Link from "next/link";
import HomeButton from "./buttons/homeButton";
import ProfileButton from "./buttons/profileButton";
import AddPostButton from "./buttons/addPostButton";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "./auth/getSession";
import { getAccount } from "./auth/getAccount";
import { getProfile } from "./auth/getProfile";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState([]);

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      console.log(session);
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            setProfile(profile);
            console.log(profile)
          }
        }
      } else {
        router.push("/login");
      }
    }
    getData();
  }, []);

  return (
    <nav className="bg-background w-full items-center inline-flex flex-row">
      <div className="items-center inline-flex flex-row flex-grow justify-between my-4 mx-5">
        <div>
          <Link href={"/"}>
            <h1 className="title">DANAMEME</h1>
          </Link>
        </div>
        <div className="flex space-x-4">
          {profile.length != 0 && <AddPostButton selected={pathname == "/create"} />}
          <HomeButton selected={pathname == "/"} />
          {profile.length != 0 && <ProfileButton />}
        </div>
      </div>
    </nav>
  );
}
