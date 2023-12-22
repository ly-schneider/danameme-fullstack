"use client";

import { checkBan } from "@/components/auth/checkBan";
import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import { handleProfileReport } from "@/components/auth/handleReport";
import CodeToBadge from "@/components/codeToBadge";
import { calcTime } from "@/components/other/calcTime";
import { calcTimeDifference } from "@/components/post/calcTimeDifference";
import { generateTitle } from "@/components/post/generateTitle";
import { handlePostDelete } from "@/components/post/handleDelete";
import { handlePostReport } from "@/components/post/handleReport";
import { handleVote } from "@/components/post/handleVote";
import supabase from "@/components/supabase";
import {
  faFlag,
  faComment,
  faPaperPlane,
} from "@fortawesome/free-regular-svg-icons";
import {
  faCheckCircle,
  faEllipsisH,
  faPen,
  faSpinner,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  mdiArrowDownBold,
  mdiArrowDownBoldOutline,
  mdiArrowUpBold,
  mdiArrowUpBoldOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Dropdown, Toast } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage({ params }) {
  const router = useRouter();

  const [profileSession, setProfileSession] = useState(null);

  const [profile, setProfile] = useState({});
  const [badges, setBadges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [joined, setJoined] = useState("");

  const [success, setSuccess] = useState("");

  const [profileGotFound, setProfileGotFound] = useState(false);

  const [addBadge, setAddBadge] = useState(false);

  const [code, setCode] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const [banned, setBanned] = useState(false);
  const [banData, setBanData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const session = await getSession();
      if (session == false) {
        setProfileSession(false);
        return false;
      }

      const accountSession = await getAccount(session.session.user.email);
      if (accountSession == false) {
        setProfileSession(false);
        return false;
      }

      const profileSession = await getProfile(accountSession.id_account);
      if (profileSession == false) {
        setProfileSession(false);
        return false;
      }
      setProfileSession(profileSession);

      const banData = await checkBan(accountSession.id_account);
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
      if (banCond) {
        return false;
      }

      const profile = await getUserProfile();
      setProfile(profile);

      if (profile == false) {
        setProfileGotFound(false);
        return false;
      }

      const badges = await getBadges(profile);
      setBadges(badges);

      const joined = await getJoined(profile);
      setJoined(joined);

      const posts = await getPosts(
        profile.id_profile,
        profileSession.id_profile
      );
      setPosts(posts);

      setProfileGotFound(true);
    }
    loadData();
  }, []);

  async function getUserProfile() {
    const { data, error } = await supabase
      .from("profile")
      .select(
        "karma, profileimage, biography, userCount, username, id_profile, account_id"
      )
      .eq("username", params.profile)
      .single();

    if (error) {
      console.log(error);
      return false;
    }

    return data;
  }

  async function getBadges(profile) {
    const { data, error } = await supabase
      .from("profile_badge")
      .select("badge_id")
      .eq("profile_id", profile.id_profile);

    if (error) {
      console.log(error);
      return false;
    }

    const badgesTemp = {};

    const badgePromises = data.map(async (badge) => {
      const { data, error } = await supabase
        .from("badge")
        .select("text, class")
        .eq("id_badge", badge.badge_id);

      if (error) {
        console.log(error);
        return false;
      }

      badgesTemp[badge.badge_id] = data[0];
    });

    await Promise.all(badgePromises);

    let sortedArrray = [];

    Object.keys(badgesTemp)
      .sort()
      .reverse()
      .forEach((key) => {
        sortedArrray.push({
          key: key,
          class: badgesTemp[key].class,
          text: badgesTemp[key].text,
        });
      });

    return sortedArrray;
  }

  async function getJoined(profile) {
    const { data, error } = await supabase
      .from("account")
      .select("createdat")
      .eq("id_account", profile.account_id);

    if (error) {
      console.log(error);
      return false;
    }

    const date = new Date(data[0].createdat);
    const dateStringCustom = `${date.toLocaleDateString("de-DE", {
      day: "numeric",
    })}. ${date.toLocaleDateString("de-DE", {
      month: "long",
    })} ${date.toLocaleDateString("de-DE", { year: "numeric" })}, ${
      date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
    }:${
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
    } Uhr`;

    return dateStringCustom;
  }

  async function getPosts(profileId, profileIdSession) {
    const { data: postsData, error: postsError } = await supabase
      .from("post")
      .select(
        "id_post, title, content, asset, createdat, profile_id, edited, profile (username, profileimage, id_profile)"
      )
      .order("createdat", { ascending: false })
      .eq("profile_id", profileId);

    if (postsError) {
      console.log(postsError);
      return;
    }

    const calcLikes = await Promise.all(
      postsData.map(async (post) => {
        const { data: ratingData, error } = await supabase
          .from("rating_post")
          .select("*")
          .eq("post_id", post.id_post);

        let count = 0;
        ratingData.map((rating) => {
          if (rating.type == true) {
            count++;
          } else {
            count--;
          }
        });

        if (error) {
          console.log(error);
          return { ...post, likes: 0 };
        }

        return { ...post, likes: count };
      })
    );

    const countComments = await Promise.all(
      calcLikes.map(async (post) => {
        const { data: commentData, error } = await supabase
          .from("comment")
          .select("*")
          .eq("post_id", post.id_post);

        if (error) {
          console.log(error);
          return { ...post, comments: 0 };
        }

        let { data: ratingData, error: ratingError } = await supabase
          .from("rating_post")
          .select("*")
          .eq("post_id", post.id_post)
          .eq("profile_id", profileIdSession);

        if (ratingError) {
          console.log(ratingError);
          return { ...post, comments: commentData.length, rating: null };
        }

        if (ratingData.length == 0) {
          ratingData = null;
        } else {
          ratingData = ratingData[0].type;
        }

        return { ...post, comments: commentData.length, rating: ratingData };
      })
    );

    return countComments;
  }

  async function handleProfileUpdate() {
    const profile = await getUserProfile();
    setProfile(profile);
  }

  async function handlePosts() {
    const posts = await getPosts(profile.id_profile, profileSession.id_profile);
    setPosts(posts);
  }

  async function handleProfileBadges() {
    const badges = await getBadges(profile);
    setBadges(badges);
  }

  async function handlePostRating() {
    const posts = await getPosts(profile.id_profile, profileSession.id_profile);
    setPosts(posts);
  }

  supabase
    .channel("profile-rating-post")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profile" },
      handleProfileUpdate
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profile_badge" },
      handleProfileBadges
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "post" },
      handlePosts
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rating_post" },
      handlePostRating
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
      {profileGotFound ? (
        <div className="mx-6 sm:mx-0 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={profile.profileimage}
                className="rounded-full border-[5px] border-accent h-24 w-24 object-cover"
              />
              <h1 className="text-text font-bold text-3xl font-poppins ms-4">
                {profile.username}
              </h1>
            </div>
            {profileSession.id_profile != profile.id_profile && (
              <div className="[&>div]:bg-background [&>div]:border-[3px] [&>div]:border-primary [&>div]:rounded-md flex items-center">
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
                  <Dropdown.Item
                    className="text text-sm hover:bg-accentBackground"
                    onClick={async () => {
                      const status = await handleProfileReport(
                        profile.id_profile,
                        profileSession.id_profile
                      );

                      if (status == true) {
                        setSuccess("Profil wurde erfolgreich gemeldet!");
                        setTimeout(() => {
                          setSuccess("");
                        }, 3000);
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faFlag} className="me-1.5" />
                    Report
                  </Dropdown.Item>
                </Dropdown>
              </div>
            )}
          </div>
          {profile.username != "DANAMEME" && (
            <>
              <div className="w-full mt-3">
                <p className="text-muted text text-sm">Beigetreten {joined}</p>
              </div>
              <div className="w-full mt-1">
                <h1 className="title font-semibold text-lg">
                  {profile.karma} Karma
                </h1>
              </div>
            </>
          )}
          <div className="flex flex-wrap gap-4 mt-3">
            {Object.keys(badges).map((badge) => {
              const item = badges[badge];
              let text = item.text;
              if (text == null) {
                text = "#" + profile.userCount;
              }
              return (
                <div
                  className={
                    item.class +
                    " px-5 py-1.5 rounded-badge flex justify-between items-center"
                  }
                  key={item.key}
                >
                  <p className="text-text text text-sm">{text}</p>
                </div>
              );
            })}
          </div>
          <p className="text mt-3 font-semibold mb-8">{profile.biography}</p>
          <hr className="seperator" />
          <div className="mt-8 space-y-16">
            {posts.map((post) => (
              <div key={post.id_post}>
                <div className="flex flex-row items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={post.profile.profileimage}
                      className="rounded-full border-[3px] border-accent h-14 w-14 object-cover"
                    />
                    <h1 className="text-text font-bold text-xl font-poppins ms-2 sm:ms-4">
                      {post.profile.username}
                    </h1>
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
                                className="ms-4 text-muted text-2xl hover:cursor-pointer"
                              />
                            )}
                          >
                            {profileSession.id_profile ==
                            post.profile.id_profile ? (
                              <>
                                <Dropdown.Item
                                  className="text text-sm hover:bg-accentBackground"
                                  onClick={() =>
                                    router.push(
                                      `/post/${generateTitle(post)}/edit`
                                    )
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
                                    const newPosts = await getPosts(
                                      profile.id_profile,
                                      profileSession.id_profile
                                    );
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
                                    profileSession.id_profile
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
                                <FontAwesomeIcon
                                  icon={faFlag}
                                  className="me-1.5"
                                />
                                Report
                              </Dropdown.Item>
                            )}
                          </Dropdown>
                        </div>
                      )}
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
                  {post.profile.username != "DANAMEME" && (
                    <div className="flex items-center">
                      <Icon
                        path={
                          post.rating == true
                            ? mdiArrowUpBold
                            : mdiArrowUpBoldOutline
                        }
                        size={1.22}
                        className="text text-2xl hover:cursor-pointer"
                        onClick={async () => {
                          await handleVote(
                            post.id_post,
                            true,
                            profileSession.id_profile
                          );
                          const posts = await getPosts(
                            profile.id_profile,
                            profileSession.id_profile
                          );
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
                          await handleVote(
                            post.id_post,
                            false,
                            profileSession.id_profile
                          );
                          const posts = await getPosts(
                            profile.id_profile,
                            profileSession.id_profile
                          );
                          setPosts(posts);
                        }}
                      />
                    </div>
                  )}
                  <div className="flex items-center">
                    <Link
                      href={`/post/${generateTitle(post)}`}
                      className="flex"
                    >
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
                <h1 className="text text-muted text-base font-bold">
                  Keine Beiträge
                </h1>
              </div>
            )}
          </div>
        </div>
      ) : (
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
                Du wurdest von {banData.bannedby} am{" "}
                {calcTime(banData.createdat)} gebannt.
              </p>
            </div>
          ) : (
            <div className="flex justify-center mt-8">
              <h1 className="title text-2xl">
                <FontAwesomeIcon icon={faSpinner} spin />
              </h1>
            </div>
          )}
        </>
      )}
    </>
  );
}
