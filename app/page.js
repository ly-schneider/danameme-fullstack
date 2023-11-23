"use client";

import CreatePost from "@/components/createPost";
import { useEffect } from "react";
import supabase from "@/components/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log(error);
      return;
    }
    if (data.session==null) {
      router.push("/login");
      return;
    }
    console.log(data);
  }

  return (
    <>
      <CreatePost />
      <hr className="border-2 border-linePrimary rounded-posts mt-8"></hr>
    </>
  );
}
