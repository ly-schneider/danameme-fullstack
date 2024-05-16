"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faCircleUp } from "@fortawesome/free-regular-svg-icons";
import { Toast } from "flowbite-react";
import { getSession } from "@/components/auth/getSession";
import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { fetchPosts } from "@/components/post/fetchPosts";
import { useRouter } from "next/navigation";
import supabase from "@/components/supabase";
import { checkBan } from "@/components/auth/checkBan";
import { calcTime } from "@/components/other/calcTime";
import ShowPost from "@/components/post/showPost";

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [profileId, setProfileId] = useState(null);
  const [profileConfirmed, setProfileConfirmed] = useState(false);
  const [success, setSuccess] = useState("");

  const [banned, setBanned] = useState(false);
  const [banData, setBanData] = useState([]);

  const [newPost, setNewPost] = useState(false);

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            setProfileId(profile.id_profile);
            setProfileConfirmed(profile.confirmed);
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
              const posts = await fetchPosts(profile.id_profile);
              setPosts(posts);
            }
          }
        }
      } else {
        const posts = await fetchPosts();
        setPosts(posts);
      }
    }
    getData();
  }, []);

  function handlePosts() {
    setNewPost(true);
    setTimeout(() => {
      setNewPost(false);
    }, 5000);
  }

  async function handleNewPost() {
    const posts = await fetchPosts(profileId);
    setPosts(posts);
    setNewPost(false);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  async function handleRating() {
    const posts = await fetchPosts(profileId);
    setPosts(posts);
  }

  supabase
    .channel("homepage-rating-post-notifications")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rating_post" },
      handleRating
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "post" },
      handlePosts
    )
    .subscribe();

  return (
    <>
      {success != "" && (
        // Goofy ahh way to center the toast
        <Toast className="bg-accentBackground fixed z-20 w-auto top-5 left-[calc(50vw_-_140.7px)]">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text text-xl me-2"
            />
            <p className="text text-sm">{success}</p>
          </div>
        </Toast>
      )}
      {newPost && (
        <Toast
          className="bg-success fixed z-20 w-auto top-5 left-[calc(50vw_-_112.5px)] hover:cursor-pointer hover:scale-[1.03] transition-all duration-300"
          onClick={() => handleNewPost()}
        >
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faCircleUp}
              className="text text-background text-lg me-2"
            />
            <p className="text text-background text-xs">
              Es gibt einen neuen Beitrag!
            </p>
          </div>
        </Toast>
      )}
      <div className="space-y-16 mx-6 sm:mx-0 mt-6">
        {posts.map((post) => (
          <ShowPost
            key={post.id_post}
            router={router}
            setSuccess={setSuccess}
            setPosts={setPosts}
            profileId={profileId}
            post={post}
            profileConfirmed={profileConfirmed}
          />
        ))}
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
          <>
            {posts.length == 0 && (
              <div className="z-0">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex items-center">
                    <div className="rounded-full bg-zinc-700 w-14 h-14 flex items-center justify-center animate-pulse"></div>
                    <hr className="border-4 border-zinc-700 ml-3 w-52 rounded-md animate-pulse" />
                  </div>
                  <div className="flex flex-col sm:flex-row w-auto justify-end items-center space-x-3">
                    <div className="flex w-full items-center">
                      <hr className="border-2 border-zinc-700 ml-3 w-20 rounded-md animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="w-full mt-6">
                  <hr className="border-[6px] border-zinc-700 w-40 rounded-md animate-pulse" />
                </div>
                <div className="w-full mt-6">
                  <div className="bg-zinc-700 w-full rounded-image h-[500px] animate-pulse"></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
