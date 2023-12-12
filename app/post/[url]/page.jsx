"use client";

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
  faReply,
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

export default function PostPage({ params }) {
  const router = useRouter();

  const [post, setPost] = useState([]);
  const [comments, setComments] = useState([]);

  const [profileId, setProfileId] = useState(null);
  const [profile, setProfile] = useState(null);

  const [commentText, setCommentText] = useState("");

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function getData() {
      const session = await checkSession();
      console.log(session);
      if (session) {
        const accountId = await getAccount(session);
        console.log(accountId);
        if (accountId) {
          const profileId = await getProfile(accountId);
          console.log(profileId);
          if (profileId) {
            const postId = await fetchPost(profileId);
            await fetchComments(postId, profileId);
          }
        }
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
      .select("*")
      .eq("account_id", accountId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setProfileId(data.id_profile);
    setProfile(data);
    return data.id_profile;
  }

  async function fetchPost(profileId) {
    const id = params.url.substr(params.url.length - 1, params.url.length);
    console.log(id);

    const { data: postsData, error: postsError } = await supabase
      .from("post")
      .select(
        "id_post, title, content, asset, createdat, profile_id, profile (username, profileimage, id_profile)"
      )
      .eq("id_post", id);

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

    console.log(checkRated);
    setPost(checkRated[0]);
    return checkRated[0].id_post;
  }

  async function fetchComments(postId, profileId) {
    const { data: commentData, error: commentError } = await supabase
      .from("comment")
      .select(
        "id_comment, post_id, text, createdat, profile_id, answer_id, profile (username, profileimage, id_profile)"
      )
      .eq("post_id", postId);

    if (commentError) {
      console.log(commentError);
      return;
    }

    const calcLikes = await Promise.all(
      commentData.map(async (comment) => {
        const { data: ratingData, error } = await supabase
          .from("rating_comment")
          .select("*")
          .eq("comment_id", comment.id_comment);

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
          return { ...comment, likes: 0 };
        }

        return { ...comment, likes: count };
      })
    );

    const checkRated = await Promise.all(
      calcLikes.map(async (comment) => {
        let { data: ratingData, error } = await supabase
          .from("rating_comment")
          .select("*")
          .eq("comment_id", comment.id_comment)
          .eq("profile_id", profileId);

        if (error) {
          console.log(error);
          return { ...comment, rating: null };
        }

        if (ratingData.length == 0) {
          ratingData = null;
        } else {
          ratingData = ratingData[0].type;
        }

        return { ...comment, rating: ratingData };
      })
    );

    const commentsWithAnswers = checkRated.map((comment) => {
      if (comment.answer_id) {
        const parentComment = checkRated.find(
          (c) => c.id_comment === comment.answer_id
        );
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = [];
          }
          parentComment.replies.push(comment);
        }
      }
      return comment;
    });

    const removeInsertedComments = (comments) => {
      return comments.filter((comment) => !comment.answer_id);
    };

    const commentsWithoutInserted = removeInsertedComments(commentsWithAnswers);

    console.log(commentsWithoutInserted);
    setComments(commentsWithoutInserted);
  }

  function calcTimeDifference(date) {
    const targetDateTime = new Date(date);
    const currentDateTime = new Date();

    const timeDifference = currentDateTime - targetDateTime;

    const secondsDifference = Math.floor(timeDifference / 1000);

    if (secondsDifference < 60) {
      return `vor ${secondsDifference} Sekunde${
        secondsDifference !== 1 ? "n" : ""
      }`;
    } else if (secondsDifference < 3600) {
      const minutes = Math.floor(secondsDifference / 60);
      return `vor ${minutes} Minute${minutes !== 1 ? "n" : ""}`;
    } else if (secondsDifference < 86400) {
      const hours = Math.floor(secondsDifference / 3600);
      return `vor ${hours} Stude${hours !== 1 ? "n" : ""}`;
    } else if (secondsDifference < 604800) {
      const days = Math.floor(secondsDifference / 86400);
      return `vor ${days} Tag${days !== 1 ? "en" : ""}`;
    } else if (secondsDifference < 2419200) {
      const weeks = Math.floor(secondsDifference / 604800);
      return `vor ${weeks} Woche${weeks !== 1 ? "n" : ""}`;
    } else if (secondsDifference < 29030400) {
      const months = Math.floor(secondsDifference / 2419200);
      return `vor ${months} Monat${months !== 1 ? "en" : ""}`;
    }
  }

  async function handleVote(id, type) {
    const { data, error } = await supabase
      .from("rating_post")
      .select("*")
      .eq("post_id", id)
      .eq("profile_id", profileId);

    if (error) {
      console.log(error);
      return;
    }

    if (data.length == 0) {
      const { data, error } = await supabase
        .from("rating_post")
        .insert({ post_id: id, profile_id: profileId, type: type });
      if (error) {
        console.log(error);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("rating_post")
        .update({ type: type })
        .eq("post_id", id)
        .eq("profile_id", profileId);
      if (error) {
        console.log(error);
        return;
      }
    }
  }

  async function handleCommentVote(id, type) {
    const { data, error } = await supabase
      .from("rating_comment")
      .select("*")
      .eq("comment_id", id)
      .eq("profile_id", profileId);

    if (error) {
      console.log(error);
      return;
    }

    if (data.length == 0) {
      const { data, error } = await supabase
        .from("rating_comment")
        .insert({ comment_id: id, profile_id: profileId, type: type });
      if (error) {
        console.log(error);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("rating_comment")
        .update({ type: type })
        .eq("comment_id", id)
        .eq("profile_id", profileId);
      if (error) {
        console.log(error);
        return;
      }
    }

    await fetchComments(post.id_post, profileId);
  }

  async function saveAnswerComment(commentId, postId, text) {
    const { data: answerData, error: answerError } = await supabase
      .from("comment")
      .insert({
        text: text,
        profile_id: profileId,
        post_id: postId,
        answer_id: commentId,
      });

    if (answerError) {
      console.log(answerError);
      return;
    }

    await fetchComments(postId, profileId);
  }

  async function handleDelete(id) {
    const { data, error } = await supabase
      .from("comment")
      .delete()
      .eq("id_comment", id);

    if (error) {
      console.log(error);
      return;
    }

    await fetchComments(post.id_post, profileId);
  }

  async function handleReport(id) {
    const { error } = await supabase
      .from("report")
      .insert({ comment_id: id, reason: "Reported" });

    if (error) {
      console.log(error);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  }

  async function addComment(postId, text) {
    const { error: commentError } = await supabase.from("comment").insert({
      text: text,
      profile_id: profileId,
      post_id: postId,
    });

    if (commentError) {
      console.log(commentError);
      return;
    }

    setCommentText("");

    await fetchComments(postId, profileId);
  }

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
            className="rounded-full border-[3px] border-accent w-12 h-12"
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
    const [showReplyForm, setShowReplyForm] = useState(false);

    const handleToggleReplyForm = () => {
      setShowReplyForm(!showReplyForm);
    };

    const handleReplySubmit = (replyText) => {
      console.log(replyText);
      if (replyText == false) {
        setShowReplyForm(false);
        return;
      }
      // Implement the logic to submit the reply, e.g., using an API call
      saveAnswerComment(comment.id_comment, comment.post_id, replyText);
    };

    return (
      <div
        key={comment.id_comment}
        className={"comment relative text [&>.comment]:ms-14 [&>.comment]:mt-6"}
        id={comment.id_comment}
      >
        <a className="block absolute top-[48px] left-0 w-[12px] h-[calc(100%-50px)] border-x-[4px] bg-primary border-transparent bg-clip-padding ms-4"></a>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={comment.profile.profileimage}
              className="rounded-full border-[3px] border-accent w-12 h-12"
            />
            <h1 className="title text-base ms-2">{comment.profile.username}</h1>
          </div>
          <div className="flex items-center">
            <p className="text-muted text-sm ms-2">
              {calcTimeDifference(comment.createdat)}
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
                {profileId == comment.profile.id_profile ? (
                  <Dropdown.Item
                    className="text text-sm hover:bg-accentBackground"
                    onClick={() => handleDelete(comment.id_comment)}
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="me-1.5" />
                    Delete
                  </Dropdown.Item>
                ) : (
                  <Dropdown.Item
                    className="text text-sm hover:bg-accentBackground"
                    onClick={() => handleReport(comment.id_comment)}
                  >
                    <FontAwesomeIcon icon={faFlag} className="me-1.5" />
                    Report
                  </Dropdown.Item>
                )}
              </Dropdown>
            </div>
          </div>
        </div>
        <p className="text ms-14">{comment.text}</p>
        <div className="flex items-center flex-row w-full mt-3 space-x-2 ms-14">
          <div className="flex items-center">
            <Icon
              path={
                comment.rating == true ? mdiArrowUpBold : mdiArrowUpBoldOutline
              }
              size={1.22}
              className="text text-2xl hover:cursor-pointer"
              onClick={() => handleCommentVote(comment.id_comment, true)}
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
              onClick={() => handleCommentVote(comment.id_comment, false)}
            />
          </div>
          <div
            className="flex items-center hover:cursor-pointer"
            onClick={handleToggleReplyForm}
          >
            <FontAwesomeIcon icon={faReply} className="text text-xl me-1.5" />
            <p className="text text-base">Antworten</p>
          </div>
        </div>

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
      {success && (
        <Toast className="bg-accentBackground fixed z-20 w-auto top-5 left-[calc(50vw_-_117.5px)]">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text text-xl me-2"
            />
            <p className="text text-sm">Kommentar wurde gemeldet</p>
          </div>
        </Toast>
      )}
      {post.length != 0 && (
        <>
          <div key={post.id_post}>
            <Link href={"/"}>
              <button className="btn-secondary items-center flex">
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className="text text-sm me-2"
                />
                Zurück
              </button>
            </Link>
            <div className="flex flex-row items-center justify-between mt-8">
              <div className="flex items-center">
                <img
                  src={post.profile.profileimage}
                  className="rounded-full border-[3px] border-accent h-16 w-16"
                />
                <h1 className="text-text font-bold text-xl font-poppins ms-2">
                  {post.profile.username}
                </h1>
              </div>
              <div className="flex items-center">
                <p className="text-muted text text-sm">
                  {calcTimeDifference(post.createdat)}
                </p>
                <FontAwesomeIcon
                  icon={faEllipsisH}
                  className="ms-4 text-muted text-2xl"
                />
              </div>
            </div>
            <div className="w-full mt-3">
              <h1 className="title text-2xl font-bold">{post.title}</h1>
              {post.content && <p className="text text-base">{post.content}</p>}
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
                  onClick={() => handleVote(post.id_post, true)}
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
                  onClick={() => handleVote(post.id_post, false)}
                />
              </div>
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
                  className="text text-2xl"
                />
              </div>
            </div>
          </div>
          <div className="w-full mt-8">
            <div className="w-full mt-3">
              <div className="flex flex-col space-y-8">
                {profile && (
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
                        onClick={() => addComment(post.id_post, commentText)}
                      >
                        Kommentieren
                      </button>
                    </div>
                  </div>
                )}
                {comments.map((comment) => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
