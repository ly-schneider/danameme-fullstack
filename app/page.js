"use client";

import CreatePost from "@/components/createPost";
import { useState, useEffect } from "react";
import supabase from "@/components/supabase";
import { useRouter } from "next/navigation";
import Login from "@/components/auth";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkSession();
    document.title = "Home | DANAMEME"
  }, []);

  async function checkSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log(error);
      setError(error);
      return;
    }
    if (data.session == null) {
      setIsLoggedIn(false);
      return;
    }
    setIsLoggedIn(true);
    console.log(data);
  }

  return (
    <>
      {isLoggedIn ? (
        <>
          <CreatePost />
          <hr className="border-2 border-linePrimary rounded-posts mt-8"></hr>
        </>
      ) : (
        <Login />
      )}
    </>
  );
}
