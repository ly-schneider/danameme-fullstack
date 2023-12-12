"use client";

import Link from "next/link";
import HomeButton from "./buttons/homeButton";
import ProfileButton from "./buttons/profileButton";
import AddPostButton from "./buttons/addPostButton";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import supabase from "./supabase";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function getData() {
      const session = await checkSession();
      if (session) {
      }
    }
    getData();
  }, []);

  async function checkSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log(error);
      return;
    }

    if (data.session == null) {
      router.push("/login");
      return;
    }

    return data.session.user.email;
  }

  async function getAccount(email) {
    const { data, error } = await supabase
      .from("account")
      .select("id_account")
      .eq("email", email)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    return data.id_account;
  }

  async function getProfile(accountId) {
    const { data, error } = await supabase
      .from("profile")
      .select("username")
      .eq("account_id", accountId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    return data.username;
  }

  return (
    <nav className="bg-background w-full items-center inline-flex flex-row">
      <div className="items-center inline-flex flex-row flex-grow justify-between my-4 mx-5">
        <div>
          <Link href={"/"}>
            <h1 className="title">DANAMEME</h1>
          </Link>
        </div>
        <div className="flex space-x-4">
          <AddPostButton selected={pathname == "/create"} />
          <HomeButton selected={pathname == "/"} />
          <ProfileButton />
        </div>
      </div>
    </nav>
  );
}
