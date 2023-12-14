"use client";

import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import CodeToBadge from "@/components/codeToBadge";
import { calcTimeDifference } from "@/components/post/calcTimeDifference";
import { fetchPosts } from "@/components/post/fetchPosts";
import { generateTitle } from "@/components/post/generateTitle";
import { handlePostDelete } from "@/components/post/handleDelete";
import { handlePostReport } from "@/components/post/handleReport";
import { handleVote } from "@/components/post/handleVote";
import supabase from "@/components/supabase";
import { faComment, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import {
  faEllipsisH,
  faFlag,
  faPen,
  faPlus,
  faSpinner,
  faTrashCan,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  mdiArrowDownBold,
  mdiArrowDownBoldOutline,
  mdiArrowUpBold,
  mdiArrowUpBoldOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Dropdown } from "flowbite-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage({ params }) {
  const [profileSession, setProfileSession] = useState(null);

  const [profile, setProfile] = useState({});
  const [badges, setBadges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [joined, setJoined] = useState("");

  const [success, setSuccess] = useState("");

  const [profileGotFound, setProfileGotFound] = useState(false);

  const [editBiography, setEditBiography] = useState(false);
  const [biography, setBiography] = useState("");

  const [addBadge, setAddBadge] = useState(false);

  const [code, setCode] = useState("");
  const [errorCode, setErrorCode] = useState("");

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

      const profile = await getUserProfile();
      console.log(profile);
      setProfile(profile);

      if (profile == false) {
        setProfileGotFound(false);
        return false;
      }

      const badges = await getBadges(profile);
      console.log(badges);
      setBadges(badges);

      const joined = await getJoined(profile);
      console.log(joined);
      setJoined(joined);

      console.log(profile.id_profile);
      const posts = await getPosts(
        profile.id_profile,
        profileSession.id_profile
      );
      console.log(posts);
      setPosts(posts);

      setBiography(profile.biography);

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
        console.log(key);
        sortedArrray.push({
          key: key,
          class: badgesTemp[key].class,
          text: badgesTemp[key].text,
        });
      });

    console.log(sortedArrray);

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
        "id_post, title, content, asset, createdat, profile_id, profile (username, profileimage, id_profile)"
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

        console.log(ratingData);

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

    console.log(countComments);
    return countComments;
  }

  async function handleUpdateBiography() {
    if (biography == "") {
      return;
    }

    const { data: updateData, error: updateError } = await supabase
      .from("profile")
      .update({ biography: biography })
      .eq("id_profile", profile.id_profile);

    if (updateError) {
      console.log(updateError);
      return;
    }

    console.log(updateData);

    setProfile({ ...profile, biography: biography });
  }

  async function addBadgeToProfile(e) {
    e.preventDefault();
    console.log(code);
    setCode("");
    setAddBadge(false);

    if (code == "") {
      setErrorCode("Code darf nicht leer sein!");
      return;
    }

    if (code.length != 6) {
      setErrorCode("Code muss 6 Zeichen lang sein!");
      return;
    }

    const data = await CodeToBadge(code);
    console.log(data);

    if (!data) {
      setErrorCode("Der Code konnte nicht überprüft werden!");
      return false;
    }
    if (data == "ungültig") {
      setErrorCode("Der Code ist ungültig!");
      return false;
    }

    const { data: badgeData, error: badgeError } = await supabase
      .from("profile_badge")
      .insert({ profile_id: profile.id_profile, badge_id: data.id_badge });

    if (badgeError) {
      console.log(badgeError);
      setErrorCode("Der Code konnte nicht hinzugefügt werden!");
      return;
    }

    const badges = await getBadges(profile);
    setBadges(badges);
  }

  async function handleRemoveBadge(badgeId) {
    const { data: badgeData, error: badgeError } = await supabase
      .from("profile_badge")
      .delete()
      .eq("profile_id", profile.id_profile)
      .eq("badge_id", badgeId);

    if (badgeError) {
      console.log(badgeError);
      return;
    }

    const badges = await getBadges(profile);
    setBadges(badges);
  }

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
        <div>
          <div className="flex items-center">
            <img
              src={profile.profileimage}
              className="rounded-full border-[5px] border-accent h-24 w-24"
            />
            <h1 className="text-text font-bold text-3xl font-poppins ms-4">
              {profile.username}
            </h1>
          </div>
          <div className="w-full mt-3">
            <p className="text-muted text text-sm">Beigetreten {joined}</p>
          </div>
          <div className="w-full mt-1">
            <h1 className="title font-semibold text-lg">
              {profile.karma} Karma
            </h1>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {Object.keys(badges).map((badge) => {
              const item = badges[badge];
              const badgesForUsers = [1, 2, 6, 7, 8, 9];
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
                  {profile.id_profile == profileSession.id_profile && (
                    <>
                      {!badgesForUsers.includes(parseInt(item.key)) && (
                        <FontAwesomeIcon
                          icon={faXmark}
                          className="text-text text text-sm ms-2 hover:cursor-pointer"
                          onClick={() => handleRemoveBadge(item.key)}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
            {addBadge ? (
              <>
                {profile.id_profile == profileSession.id_profile && (
                  <div className="flex w-1/2">
                    <form
                      className="w-full"
                      onSubmit={(e) => addBadgeToProfile(e)}
                    >
                      <label
                        className={
                          "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
                          (errorCode != ""
                            ? " bg-error opacity-50"
                            : " bg-primary ")
                        }
                        htmlFor="code"
                      >
                        Code
                      </label>
                      {errorCode != "" && (
                        <div className="bg-error rounded-t-div px-3 py-2 text-text text text-sm">
                          {errorCode}
                        </div>
                      )}
                      <input
                        className={
                          "input w-full" +
                          (errorCode != ""
                            ? " border-error rounded-b-form rounded-t-none"
                            : "")
                        }
                        id="code"
                        type="number"
                        autoComplete="off"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                      <div className="flex w-full justify-between mt-4 space-x-4">
                        <button
                          type="button"
                          onClick={() => setAddBadge(false)}
                          className="btn-secondary text text-xs hover:bg-background hover:text-text hover:border-text transition-all duration-500"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="btn-primary text text-xs border-[3px] border-primary hover:bg-background hover:text-text hover:border-text transition-all duration-500"
                        >
                          Hinzufügen
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <>
                {profile.id_profile == profileSession.id_profile && (
                  <div
                    className={
                      "bg-muted px-5 py-1.5 rounded-badge hover:cursor-pointer"
                    }
                    onClick={() => setAddBadge(true)}
                  >
                    <p className="text-text text text-sm">
                      <FontAwesomeIcon icon={faPlus} />
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          {editBiography ? (
            <form className="w-full mt-3">
              <textarea
                className="w-full rounded-input input"
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                rows={5}
              />
              <div className="w-full flex justify-end mt-2 mb-8 space-x-4">
                <button
                  onClick={() => setEditBiography(false)}
                  className="btn-secondary text text-xs hover:bg-background hover:text-text hover:border-text transition-all duration-500"
                >
                  Abbrechen
                </button>
                <button
                  onClick={async () => {
                    await handleUpdateBiography();
                    setEditBiography(false);
                  }}
                  className="btn-primary text text-xs border-[3px] border-primary hover:bg-background hover:text-text hover:border-text transition-all duration-500"
                >
                  Speichern
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text mt-3 font-semibold mb-8">{biography}</p>
              {profileSession &&
                profileSession.id_profile == profile.id_profile && (
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() => setEditBiography(true)}
                      className="mt-8 mb-3 bg-primary text-xs text-white py-2 px-2.5 rounded-full border-2 border-transparent hover:bg-background hover:text-text hover:border-text transition-all duration-500"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                  </div>
                )}
            </>
          )}
          <hr className="seperator" />
          <div className="mt-8 space-y-16">
            {posts.map((post) => (
              <div key={post.id_post}>
                <div className="flex flex-row items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={post.profile.profileimage}
                      className="rounded-full border-[3px] border-accent h-14 w-14"
                    />
                    <h1 className="text-text font-bold text-xl font-poppins ms-4">
                      {post.profile.username}
                    </h1>
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
                        {profileSession.id_profile ==
                        post.profile.id_profile ? (
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
                            Delete
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item
                            className="text text-sm hover:bg-accentBackground"
                            onClick={async () => {
                              const status = await handlePostReport(
                                post.id_post
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
                      className="text text-2xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center mt-8">
          <h1 className="title text-2xl">
            <FontAwesomeIcon icon={faSpinner} spin />
          </h1>
        </div>
      )}
    </>
  );
}
