"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import {
  faCheckCircle,
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

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [profileId, setProfileId] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const accountId = await getAccount(session.session.user.email);
        if (accountId) {
          const profileId = await getProfile(accountId.id_account);
          if (profileId) {
            setProfileId(profileId.id_profile);
            const posts = await fetchPosts(profileId.id_profile);
            setPosts(posts);
          }
        }
      } else {
        router.push("/login");
      }
    }
    getData();
  }, []);

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
      <div className="space-y-16">
        {posts.map((post) => (
          <div key={post.id_post}>
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center">
                <Link href={`/p/${post.profile.username}`} passHref>
                  <img
                    src={post.profile.profileimage}
                    className="rounded-full border-[3px] border-accent h-14 w-14 object-cover"
                  />
                </Link>
                <Link href={`/p/${post.profile.username}`} passHref>
                  <h1 className="text-text font-bold text-xl font-poppins ms-4">
                    {post.profile.username}
                  </h1>
                </Link>
              </div>
              <div className="flex items-center">
                <p className="text-muted text text-sm">
                  {calcTimeDifference(post.createdat)}
                </p>
                <div className="[&>div]:bg-background [&>div]:border-[3px] [&>div]:border-primary [&>div]:rounded-md">
                  <Dropdown
                    dismissOnClick={false}
                    label=""
                    renderTrigger={() => (
                      <FontAwesomeIcon
                        icon={faEllipsisH}
                        className="ms-4 text-muted text-2xl hover:cursor-pointer"
                      />
                    )}
                  >
                    {profileId == post.profile.id_profile ? (
                      <Dropdown.Item
                        className="text text-sm hover:bg-accentBackground"
                        onClick={async () => {
                          await handlePostDelete(post.id_post);
                          const newPosts = await fetchPosts(profileId);
                          setPosts(newPosts);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="me-1.5" />
                        Delete
                      </Dropdown.Item>
                    ) : (
                      <Dropdown.Item
                        className="text text-sm hover:bg-accentBackground"
                        onClick={async () => {
                          const status = await handlePostReport(post.id_post);
                          if (status == true) {
                            setSuccess("Beitrag wurde erfolgreich gemeldet!");
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
              </div>
            </div>
            <div className="w-full mt-3">
              <Link href={`/post/${generateTitle(post)}`}>
                <h1 className="title text-2xl font-bold">{post.title}</h1>
                {post.content && (
                  <p className="text text-base">{post.content}</p>
                )}
              </Link>
            </div>
            {post.asset && (
              <div className="w-full mt-3">
                <img src={post.asset} className="w-full rounded-image" />
              </div>
            )}
            <div className="flex items-center flex-row w-full mt-3 space-x-2">
              <div className="flex items-center">
                <Icon
                  path={
                    post.rating == true ? mdiArrowUpBold : mdiArrowUpBoldOutline
                  }
                  size={1.22}
                  className="text text-2xl hover:cursor-pointer"
                  onClick={async () => {
                    await handleVote(post.id_post, true, profileId);
                    const posts = await fetchPosts(profileId);
                    setPosts(posts);
                  }}
                />
                <p className="text text-base mx-0.5">{post.likes}</p>
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
              </div>
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
        {posts.length == 0 && (
          <div className="flex flex-col items-center w-full">
            <h1 className="text text-2xl font-extrabold">Keine Beiträge</h1>
            <p className="text text-base">Erstelle den ersten Beitrag!</p>
          </div>
        )}
      </div>
    </>
  );
}
