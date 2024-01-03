"use client";

import { checkBan } from "@/components/auth/checkBan";
import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import { addComment } from "@/components/comment/addComment";
import { handleCommentDelete } from "@/components/comment/handleDelete";
import { handleCommentReport } from "@/components/comment/handleReport";
import { handleCommentVote } from "@/components/comment/handleVote";
import { fetchComments } from "@/components/comment/fetchComments";
import { saveAnswerComment } from "@/components/comment/saveAnswer";
import { updateComment } from "@/components/comment/updateComment";
import { calcTimeDifference } from "@/components/post/calcTimeDifference";
import { generateTitle } from "@/components/post/generateTitle";
import { handlePostDelete } from "@/components/post/handleDelete";
import { handlePostReport } from "@/components/post/handleReport";
import { handleVote } from "@/components/post/handleVote";
import supabase from "@/components/supabase";
import {
  faComment,
  faFlag,
  faPaperPlane,
} from "@fortawesome/free-regular-svg-icons";
import {
  faArrowLeft,
  faCheckCircle,
  faEllipsisH,
  faPen,
  faReply,
  faRotateRight,
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
import { Dropdown, Modal, Toast } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { calcTime } from "@/components/other/calcTime";

export default function PostPage({ params }) {
  const router = useRouter();

  const [post, setPost] = useState([]);
  const [comments, setComments] = useState([]);

  const [profile, setProfile] = useState(null);

  const [commentText, setCommentText] = useState("");

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const [banned, setBanned] = useState(false);
  const [commentBanned, setCommentBanned] = useState(false);
  const [banData, setBanData] = useState([]);

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            setProfile(profile);
            const banData = await checkBan(account.id_account);
            let banCond = false;
            if (banData.length > 0) {
              banData.forEach((ban) => {
                if (ban.type == "account") {
                  setBanned(true);
                  setBanData(ban);
                  banCond = true;
                } else if (ban.type == "comment") {
                  setCommentBanned(true);
                  setBanData(ban);
                }
              });
            }

            if (!banCond) {
              const post = await fetchPost(profile.id_profile);
              if (post == null) {
                setPost([]);
              } else {
                setPost(post);
              }
              if (post != null) {
                const comments = await fetchComments(
                  post.id_post,
                  profile.id_profile
                );
                setComments(comments);
              }
            }
          }
        }
      }
    }
    getData();
  }, []);

  async function fetchPost(profileId) {
    let id = params.url.split("-");
    id = id[id.length - 1];

    const { data: postsData, error: postsError } = await supabase
      .from("post")
      .select(
        "id_post, title, content, asset, createdat, profile_id, edited, pinned, profile (username, profileimage, id_profile)"
      )
      .eq("id_post", id);

    if (postsError) {
      console.log(postsError);
      return;
    }

    if (postsData.length == 0) {
      return null;
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

    const checkRated = await Promise.all(
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
          .eq("profile_id", profileId);

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

    return checkRated[0];
  }

  async function handleRatingPost() {
    const post = await fetchPost(profile.id_profile);
    setPost(post);
    if (post != null) {
      const comments = await fetchComments(post.id_post, profile.id_profile);
      setComments(comments);
    }
  }

  async function handleComment() {
    const newComment = await fetchComments(post.id_post, profile.id_profile);
    setComments(newComment);
  }

  supabase
    .channel("changes-rating-comment")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rating_post" },
      handleRatingPost
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rating_comment" },
      handleComment
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comment" },
      handleComment
    )
    .subscribe();

  function ReplyForm({ onReplySubmit }) {
    const [replyText, setReplyText] = useState();

    const handleInputChange = (e) => {
      setReplyText(e.target.value);
    };

    const handleReplySubmit = () => {
      onReplySubmit(replyText);
      setReplyText(""); // Clear the textarea after submitting the reply
    };

    const handleCancel = () => {
      onReplySubmit(false);
    };

    return (
      <div className="ms-14 mt-6">
        <div className="flex items-center">
          <img
            src={profile.profileimage}
            className="rounded-full border-[3px] border-accent w-12 h-12 object-cover"
          />
          <h1 className="title text-base ms-2">{profile.username}</h1>
        </div>
        <div className="ms-14">
          <textarea
            className="min-h-[45px] max-h-[200px] w-full h-24 mt-2 bg-background border-primary border-[3px] input"
            onChange={handleInputChange}
          />
          <div className="flex items-center flex-row w-full justify-between mt-3">
            <button className="btn-secondary" onClick={handleCancel}>
              Abbrechen
            </button>
            <button
              className="btn-primary border-[3px] border-primary"
              onClick={handleReplySubmit}
            >
              Kommentieren
            </button>
          </div>
        </div>
      </div>
    );
  }

  function Comment({ comment }) {
    const [commentText, setCommentText] = useState("");
    const [editComment, setEditComment] = useState(false);

    const [showReplyForm, setShowReplyForm] = useState(false);

    function handleToggleReplyForm() {
      setShowReplyForm(!showReplyForm);
    }

    async function handleReplySubmit(replyText) {
      if (replyText == false) {
        setShowReplyForm(false);
        return;
      }

      saveAnswerComment(
        comment.id_comment,
        comment.post_id,
        replyText,
        profile.id_profile
      );

      const newComments = await fetchComments(post.id_post, profile.id_profile);
      setComments(newComments);
    }

    return (
      <div
        key={comment.id_comment}
        className={"comment relative text [&>.comment]:ms-14 [&>.comment]:mt-6"}
        id={comment.id_comment}
      >
        <a className="block absolute top-[48px] left-0 w-[12px] h-[calc(100%-50px)] border-x-[4px] bg-primary border-transparent bg-clip-padding ms-4"></a>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href={`/p/${comment.profile.username}`} passHref>
              <img
                src={comment.profile.profileimage}
                className="rounded-full border-[3px] border-accent w-12 h-12 object-cover"
              />
            </Link>
            <Link href={`/p/${comment.profile.username}`} passHref>
              <h1 className="title text-base ms-2">
                {comment.profile.username}
              </h1>
            </Link>
          </div>
          <div className="flex items-center">
            {comment.edited && (
              <p className="text-muted text text-xs sm:text-sm mr-2">
                (Bearbeitet)
              </p>
            )}
            <p className="text-muted text-xs sm:text-sm ms-2">
              {calcTimeDifference(comment.createdat)}
            </p>
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
                {profile.id_profile == comment.profile.id_profile ? (
                  <>
                    <Dropdown.Item
                      className={
                        (commentBanned
                          ? "pointer-events-none text-muted hover:bg-inherit"
                          : "hover:bg-accentBackground") + " text text-sm"
                      }
                      onClick={() => {
                        setEditComment(!editComment);
                        setCommentText(comment.text);
                      }}
                    >
                      <FontAwesomeIcon icon={faPen} className="me-1.5" />
                      Bearbeiten
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text text-sm hover:bg-accentBackground"
                      onClick={async () => {
                        await handleCommentDelete(comment.id_comment);
                        const newComments = await fetchComments(
                          post.id_post,
                          profile.id_profile
                        );
                        setComments(newComments);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="me-1.5" />
                      Löschen
                    </Dropdown.Item>
                  </>
                ) : (
                  <Dropdown.Item
                    className="text text-sm hover:bg-accentBackground"
                    onClick={async () => {
                      handleCommentReport(
                        comment.id_comment,
                        profile.id_profile
                      );

                      setSuccess("Kommentar wurde gemeldet!");
                      setTimeout(() => {
                        setSuccess("");
                      }, 3000);
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
        {editComment ? (
          <div className="mt-3 ms-14">
            <textarea
              className="min-h-[45px] max-h-[200px] w-full h-24 mt-2 bg-background border-primary border-[3px] input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flex items-center flex-row w-full justify-end mt-3">
              <button
                className={
                  commentText.length > 0 && commentText != comment.text
                    ? "btn-primary border-[3px] border-primary"
                    : "btn-secondary text-muted pointer-events-none hover:cursor-default"
                }
                onClick={async () => {
                  const status = await updateComment(
                    comment.id_comment,
                    commentText
                  );
                  setCommentText("");
                  if (!status) {
                    setError("Ein Fehler ist aufgetreten!");
                    setTimeout(() => {
                      setError("");
                    }, 3000);
                    return;
                  }
                  const newComments = await fetchComments(
                    post.id_post,
                    profile.id_profile
                  );
                  setComments(newComments);
                }}
              >
                Aktualisieren
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text ms-14 whitespace-pre-line">{comment.text}</p>
            <div className="flex items-center flex-row w-full mt-3 space-x-2 ms-14">
              <div className="flex items-center">
                <Icon
                  path={
                    comment.rating == true
                      ? mdiArrowUpBold
                      : mdiArrowUpBoldOutline
                  }
                  size={1.22}
                  className="text text-2xl hover:cursor-pointer"
                  onClick={async () => {
                    await handleCommentVote(
                      comment.id_comment,
                      true,
                      profile.id_profile
                    );
                    const newComment = await fetchComments(
                      post.id_post,
                      profile.id_profile
                    );
                    setComments(newComment);
                  }}
                />
                <p className="text text-base mx-0.5">{comment.likes}</p>
                <Icon
                  path={
                    comment.rating == false
                      ? mdiArrowDownBold
                      : mdiArrowDownBoldOutline
                  }
                  size={1.22}
                  className="text text-2xl hover:cursor-pointer"
                  onClick={async () => {
                    await handleCommentVote(
                      comment.id_comment,
                      false,
                      profile.id_profile
                    );
                    const newComment = await fetchComments(
                      post.id_post,
                      profile.id_profile
                    );
                    setComments(newComment);
                  }}
                />
              </div>
              <div
                className={
                  (commentBanned
                    ? "pointer-events-none"
                    : "hover:cursor-pointer") + " flex items-center"
                }
                onClick={handleToggleReplyForm}
              >
                <FontAwesomeIcon
                  icon={faReply}
                  className={
                    (commentBanned && "text-muted ") + "text text-xl me-1.5"
                  }
                />
                <p
                  className={
                    (commentBanned && "text-muted ") + "text text-base"
                  }
                >
                  Antworten
                </p>
              </div>
            </div>
          </>
        )}

        {showReplyForm && <ReplyForm onReplySubmit={handleReplySubmit} />}

        {comment.replies &&
          comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} />
          ))}
      </div>
    );
  }

  return (
    <>
      {success != "" && (
        <Toast className="bg-accentBackground fixed z-20 w-auto top-5 left-[calc(50vw_-_117.5px)]">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text text-xl me-2"
            />
            <p className="text text-sm">{success}</p>
          </div>
        </Toast>
      )}
      {post.length != 0 ? (
        <>
          <div key={post.id_post} className="mx-6 sm:mx-0 mt-4">
            <button
              className="btn-secondary items-center flex"
              onClick={() => router.back()}
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="text text-sm me-2"
              />
              Zurück
            </button>
            <div className="flex flex-row items-center justify-between mt-8">
              <div className="flex items-center">
                <Link href={`/p/${post.profile.username}`} passHref>
                  <img
                    src={post.profile.profileimage}
                    className="rounded-full border-[3px] border-accent h-16 w-16 object-cover"
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
                            className="ms-4 text-muted text-2xl hover:cursor-pointer"
                          />
                        )}
                      >
                        {profile.id_profile == post.profile.id_profile ? (
                          <Dropdown.Item
                            className="text text-sm hover:bg-accentBackground"
                            onClick={async () => {
                              await handlePostDelete(post.id_post);
                              router.push("/");
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
                              handlePostReport(
                                post.id_post,
                                profile.id_profile
                              );

                              setSuccess("Beitrag wurde gemeldet!");
                              setTimeout(() => {
                                setSuccess("");
                              }, 3000);
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
            <div className="w-full mt-3">
              <h1 className="title text-2xl font-bold">{post.title}</h1>
              {post.content && (
                <p className="text text-base whitespace-pre-line">
                  {post.content}
                </p>
              )}
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
                      await handleVote(post.id_post, true, profile.id_profile);
                      const postNew = await fetchPost(profile.id_profile);
                      setPost(postNew);
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
                      await handleVote(post.id_post, false, profile.id_profile);
                      const postNew = await fetchPost(profile.id_profile);
                      setPost(postNew);
                    }}
                  />
                </div>
              )}
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faComment}
                  className="text text-2xl me-1"
                />
                <p className="text text-base">{post.comments}</p>
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
          <div className="sm:w-full mt-8 mx-6 sm:mx-0">
            <div className="w-full mt-3">
              <div className="flex flex-col space-y-8">
                {commentBanned ? (
                  <div className="flex flex-col w-full">
                    <h1 className="text text-muted text-base font-bold">
                      Kommentieren ist bis zum {calcTime(banData.until)} nicht
                      möglich!
                    </h1>
                    <p className="text text-base font-bold text-muted mt-0">
                      Grund dafür ist: {banData.reason}
                    </p>
                    <p className="text text-xs text-muted mt-3">
                      Du wurdest von {banData.bannedby} am{" "}
                      {calcTime(banData.createdat)} gebannt.
                    </p>
                  </div>
                ) : (
                  <div className="">
                    <p className="text text-muted">
                      Kommentiere als{" "}
                      <span className="text-accent">{profile.username}</span>
                    </p>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[45px] max-h-[200px] w-full h-24 mt-2 bg-background border-primary border-[3px] input"
                    />
                    <div className="flex items-center flex-row w-full justify-end mt-3">
                      <button
                        className={
                          commentText.length > 0
                            ? "btn-primary border-[3px] border-primary"
                            : "btn-secondary text-muted"
                        }
                        onClick={async () => {
                          const status = await addComment(
                            post.profile_id,
                            post.id_post,
                            commentText,
                            profile.id_profile
                          );
                          setCommentText("");
                          if (!status) {
                            setError("Ein Fehler ist aufgetreten!");
                            setTimeout(() => {
                              setError("");
                            }, 3000);
                            return;
                          }
                          const newComments = await fetchComments(
                            post.id_post,
                            profile.id_profile
                          );
                          setComments(newComments);
                        }}
                      >
                        Kommentieren
                      </button>
                    </div>
                  </div>
                )}
                {comments.length == 0 && (
                  <div className="flex flex-col items-center w-full">
                    <h1 className="text text-muted text-base font-bold">
                      Keine Kommentare
                    </h1>
                  </div>
                )}
                {comments.map((comment) => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-3">
          <button className="btn-secondary" onClick={() => router.back()}>
            <FontAwesomeIcon icon={faArrowLeft} className="text text-sm me-2" />
            Zurück
          </button>
          <div className="flex flex-row items-center justify-between mt-8">
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
            <div className="bg-zinc-700 w-full rounded-image h-[250px] animate-pulse"></div>
          </div>
        </div>
      )}
    </>
  );
}
