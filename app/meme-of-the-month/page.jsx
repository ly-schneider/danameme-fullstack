"use client";

import { Dropdown } from "flowbite-react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisH,
  faMapPin,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { faFlag, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import supabase from "@/components/supabase";
import { useEffect, useState } from "react";
import { calcTimeDifference } from "@/components/post/calcTimeDifference";
import { fetchPosts } from "@/components/post/fetchPosts";
import { generateTitle } from "@/components/post/generateTitle";
import { handlePostReport } from "@/components/post/handleReport";
import LazyImage from "@/components/post/lazyImage";

export default function MotmPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts();
  }, []);

  async function getPosts() {
    const { data, error } = await supabase
      .from("meme_of_the_month")
      .select("*, post (*, profile (*))")
      .order("month", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }
    console.log(data);

    // Group the data into years
    let groupedData = {};
    data.forEach((post) => {
      const year = new Date(post.month).getFullYear();
      if (!groupedData[year]) {
        groupedData[year] = [];
      }
      groupedData[year].push(post);
    });

    console.log(groupedData);

    setPosts(groupedData);
  }

  return (
    <div className="mt-8 mx-5 sm:mx-0">
      <h1 className="title">Meme of the Month Archiv</h1>
      <div className="flex flex-col space-y-5 mt-8">
        {Object.keys(posts).map((year) => (
          <div key={year}>
            <h1 className="title text-3xl">{year}</h1>
            <hr className="border-2" />
            <div className="flex flex-col space-y-12 mt-8">
              {posts[year].map((motm) => (
                <div key={motm.id_motm}>
                  <h2 className="title text-3xl mb-4">
                    {new Date(motm.month).toLocaleDateString("de-DE", {
                      month: "long",
                    })}
                    :
                  </h2>
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                      <Link href={`/p/${motm.post.profile.username}`}>
                        <img
                          src={motm.post.profile.profileimage}
                          className="rounded-full border-[3px] border-accent h-14 w-14 object-cover"
                        />
                      </Link>
                      <Link href={`/p/${motm.post.profile.username}`} passHref>
                        <h1 className="text-text font-bold text-xl font-poppins ms-2 sm:ms-4">
                          {motm.post.profile.username}
                        </h1>
                      </Link>
                    </div>
                    <div className="flex flex-col sm:flex-row w-auto justify-end items-center space-x-3">
                      {motm.post.edited && (
                        <p className="text-muted sm:w-1/2 w-full text-end text text-xs sm:text-sm">
                          (Bearbeitet)
                        </p>
                      )}
                      <div className="flex w-full items-center">
                        <p className="text-muted w-full text text-xs sm:text-sm">
                          {calcTimeDifference(motm.post.createdat)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {motm.post.pinned && (
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
                    <Link href={`/post/${generateTitle(motm.post)}`}>
                      <h1 className="title text-2xl font-bold">
                        {motm.post.title}
                      </h1>
                      {motm.post.content ? (
                        <div
                          dangerouslySetInnerHTML={renderContent(
                            motm.post.content
                          )}
                        ></div>
                      ) : (
                        <></>
                      )}
                    </Link>
                  </div>
                  {motm.post.asset && (
                    <div className="w-full mt-3">
                      <Link href={`/post/${generateTitle(motm.post)}`} passHref>
                        <LazyImage
                          src={motm.post.asset}
                          alt={motm.post.title ? motm.post.title : "Post"}
                        />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
