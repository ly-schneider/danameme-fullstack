import { Dropdown } from "flowbite-react";
import { calcTimeDifference } from "./calcTimeDifference";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisH,
  faMapPin,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { generateTitle } from "./generateTitle";
import { handlePostDelete } from "./handleDelete";
import { fetchPosts } from "./fetchPosts";
import {
  faComment,
  faFlag,
  faPaperPlane,
  faTrashCan,
} from "@fortawesome/free-regular-svg-icons";
import { handlePostReport } from "./handleReport";
import renderContent from "./renderContent";
import LazyImage from "./lazyImage";
import Icon from "@mdi/react";
import {
  mdiArrowDownBold,
  mdiArrowDownBoldOutline,
  mdiArrowUpBold,
  mdiArrowUpBoldOutline,
} from "@mdi/js";
import { handleVote } from "./handleVote";

export default function ShowPost({
  router,
  setSuccess,
  setPosts,
  profileId,
  post,
  profileConfirmed,
}) {
  return (
    <div>
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
                        <FontAwesomeIcon icon={faPen} className="me-1.5" />
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
                        <FontAwesomeIcon icon={faTrashCan} className="me-1.5" />
                        Löschen
                      </Dropdown.Item>
                    </>
                  ) : (
                    profileConfirmed == true && (
                      <Dropdown.Item
                        className="text text-sm hover:bg-accentBackground"
                        onClick={async () => {
                          const status = await handlePostReport(
                            post.id_post,
                            profileId
                          );
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
                    )
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
            <FontAwesomeIcon icon={faMapPin} className="text text-xl me-2" />
            <p className="text text-sm ms-1 font-bold">Fixiert</p>
          </div>
        </div>
      )}
      <div className="w-full mt-3">
        <Link href={`/post/${generateTitle(post)}`}>
          <h1 className="title text-2xl font-bold">{post.title}</h1>
          {post.content ? (
            <div dangerouslySetInnerHTML={renderContent(post.content)}></div>
          ) : (
            <></>
          )}
        </Link>
      </div>
      {post.asset && (
        <div className="w-full mt-3">
          <Link href={`/post/${generateTitle(post)}`} passHref>
            <LazyImage
              src={post.asset}
              alt={post.title ? post.title : "Post"}
            />
          </Link>
        </div>
      )}
      <div className="flex items-center flex-row w-full mt-3 space-x-2">
        {post.profile.username != "DANAMEME" && (
          <div className="flex items-center">
            <div className="flex flex-row items-center">
              <Icon
                path={
                  post.rating == true ? mdiArrowUpBold : mdiArrowUpBoldOutline
                }
                size={1.22}
                className={
                  "text text-2xl hover:cursor-pointer" +
                  (profileConfirmed ? "" : " text-muted pointer-events-none")
                }
                onClick={async () => {
                  await handleVote(post.id_post, true, profileId);
                  const newPosts = await fetchPosts(profileId);
                  setPosts(newPosts);
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
                className={
                  "text text-2xl hover:cursor-pointer" +
                  (profileConfirmed ? "" : " text-muted pointer-events-none")
                }
                onClick={async () => {
                  await handleVote(post.id_post, false, profileId);
                  const newPosts = await fetchPosts(profileId);
                  setPosts(newPosts);
                }}
              />
              <p className="text text-base me-0.5">{post.downvotes}</p>
            </div>
          </div>
        )}
        <div className="flex items-center">
          <Link href={`/post/${generateTitle(post)}`} className="flex">
            <FontAwesomeIcon icon={faComment} className="text text-2xl me-1" />
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
  );
}
