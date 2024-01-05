"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowCircleUp,
  faArrowUp,
  faCheckCircle,
  faEllipsisH,
  faMapPin,
  faPen,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  faCircleUp,
  faComment,
  faFlag,
  faPaperPlane,
  faTrashCan,
} from "@fortawesome/free-regular-svg-icons";
import Icon from "@mdi/react";
import {
  mdiArrowDownBold,
  mdiArrowDownBoldOutline,
  mdiArrowUpBold,
  mdiArrowUpBoldOutline,
} from "@mdi/js";
import { Dropdown, Toast } from "flowbite-react";
import { getSession } from "@/components/auth/getSession";
import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { fetchPosts } from "@/components/post/fetchPosts";
import { calcTimeDifference } from "@/components/post/calcTimeDifference";
import { handleVote } from "@/components/post/handleVote";
import { handlePostDelete } from "@/components/post/handleDelete";
import { handlePostReport } from "@/components/post/handleReport";
import { generateTitle } from "@/components/post/generateTitle";
import { useRouter } from "next/navigation";
import supabase from "@/components/supabase";
import { checkBan } from "@/components/auth/checkBan";
import { calcTime } from "@/components/other/calcTime";
import LazyImage from "@/components/post/lazyImage";

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [profileId, setProfileId] = useState(null);
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
        router.push("/login");
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
          <div key={post.id_post}>
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center">
                <Link href={`/p/${post.profile.username}`}>
                  <img
                    src={post.profile.profileimage}
                    className="rounded-full border-[3px] border-accent h-14 w-14 object-cover"
                  />
                </Link>
                <Link href={`/p/${post.profile.username}`} passHref>
                  <h1 className="text-text font-bold text-xl font-poppins ms-2 sm:ms-4">
                    {post.profile.username}
                  </h1>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row w-auto justify-end items-center space-x-3">
                {post.edited && (
                  <p className="text-muted sm:w-1/2 w-full text-end text text-xs sm:text-sm">
                    (Bearbeitet)
                  </p>
                )}
                <div className="flex w-full items-center">
                  <p className="text-muted w-full text text-xs sm:text-sm">
                    {calcTimeDifference(post.createdat)}
                  </p>
                  {post.profile.username != "DANAMEME" && (
                    <div className="[&>div]:bg-background [&>div]:border-[3px] [&>div]:border-primary [&>div]:rounded-md flex items-center">
                      <Dropdown
                        dismissOnClick={false}
                        label=""
                        renderTrigger={() => (
                          <FontAwesomeIcon
                            icon={faEllipsisH}
                            className="ms-2 sm:ms-4 text-muted text-2xl hover:cursor-pointer"
                          />
                        )}
                      >
                        {profileId == post.profile.id_profile ? (
                          <>
                            <Dropdown.Item
                              className="text text-sm hover:bg-accentBackground"
                              onClick={() =>
                                router.push(`/post/${generateTitle(post)}/edit`)
                              }
                            >
                              <FontAwesomeIcon
                                icon={faPen}
                                className="me-1.5"
                              />
                              Bearbeiten
                            </Dropdown.Item>
                            <Dropdown.Item
                              className="text text-sm hover:bg-accentBackground"
                              onClick={async () => {
                                await handlePostDelete(post.id_post);
                                const newPosts = await fetchPosts(profileId);
                                setPosts(newPosts);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faTrashCan}
                                className="me-1.5"
                              />
                              Löschen
                            </Dropdown.Item>
                          </>
                        ) : (
                          <Dropdown.Item
                            className="text text-sm hover:bg-accentBackground"
                            onClick={async () => {
                              const status = await handlePostReport(
                                post.id_post,
                                profileId
                              );
                              if (status == true) {
                                setSuccess(
                                  "Beitrag wurde erfolgreich gemeldet!"
                                );
                                setTimeout(() => {
                                  setSuccess("");
                                }, 3000);
                              }
                            }}
                          >
                            <FontAwesomeIcon icon={faFlag} className="me-1.5" />
                            Report
                          </Dropdown.Item>
                        )}
                      </Dropdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {post.pinned && (
              <div className="flex flex-row items-center mt-3">
                <div className="bg-primary flex px-5 py-2 rounded-badge">
                  <FontAwesomeIcon
                    icon={faMapPin}
                    className="text text-xl me-2"
                  />
                  <p className="text text-sm ms-1 font-bold">Fixiert</p>
                </div>
              </div>
            )}
            <div className="w-full mt-3">
              <Link href={`/post/${generateTitle(post)}`}>
                <h1 className="title text-2xl font-bold">{post.title}</h1>
                {post.content && (
                  <p className="text text-base whitespace-pre-line">
                    {post.content}
                  </p>
                )}
              </Link>
            </div>
            {post.asset && (
              <div className="w-full mt-3">
                <LazyImage
                  src={post.asset}
                  alt={post.title ? post.title : "Post"}
                />
              </div>
            )}
            <div className="flex items-center flex-row w-full mt-3 space-x-2">
              {post.profile.username != "DANAMEME" && (
                <div className="flex items-center">
                  <div className="flex flex-row items-center">
                    <Icon
                      path={
                        post.rating == true
                          ? mdiArrowUpBold
                          : mdiArrowUpBoldOutline
                      }
                      size={1.22}
                      className="text text-2xl hover:cursor-pointer"
                      onClick={async () => {
                        await handleVote(post.id_post, true, profileId);
                        const posts = await fetchPosts(profileId);
                        setPosts(posts);
                      }}
                    />
                    <p className="text text-base me-0.5">{post.upvotes}</p>
                  </div>
                  <div className="flex flex-row items-center">
                    <Icon
                      path={
                        post.rating == false
                          ? mdiArrowDownBold
                          : mdiArrowDownBoldOutline
                      }
                      size={1.22}
                      className="text text-2xl hover:cursor-pointer"
                      onClick={async () => {
                        await handleVote(post.id_post, false, profileId);
                        const posts = await fetchPosts(profileId);
                        setPosts(posts);
                      }}
                    />
                    <p className="text text-base me-0.5">{post.downvotes}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <Link href={`/post/${generateTitle(post)}`} className="flex">
                  <FontAwesomeIcon
                    icon={faComment}
                    className="text text-2xl me-1"
                  />
                  <p className="text text-base">{post.comments}</p>
                </Link>
              </div>
              <div>
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className="text text-2xl hover:cursor-pointer"
                  onClick={() => {
                    const url = window.location.origin;
                    navigator.clipboard.writeText(
                      `${url}/post/${generateTitle(post)}`
                    );
                    setSuccess("Link wurde kopiert!");
                    setTimeout(() => {
                      setSuccess("");
                    }, 3000);
                  }}
                />
              </div>
            </div>
          </div>
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
