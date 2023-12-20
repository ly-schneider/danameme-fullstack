"use client";

import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import supabase from "@/components/supabase";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditPost({ params }) {
  const router = useRouter();

  const [profile, setProfile] = useState([]);

  const [postId, setPostId] = useState("");

  const [title, setTitle] = useState("");
  const [errorTitle, setErrorTitle] = useState("");

  const [text, setText] = useState("");
  const [errorText, setErrorText] = useState("");

  const [oldFile, setOldFile] = useState("");
  const [file, setFile] = useState("");
  const [errorImage, setErrorImage] = useState("");

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const accountId = await getAccount(session.session.user.email);
        if (accountId) {
          const profile = await getProfile(accountId.id_account);
          if (profile) {
            setProfile(profile);
            const post = await fetchPost(profile);
            setTitle(post.title);
            setText(post.content);
            setFile(post.asset);
            setOldFile(post.asset);
            setPostId(post.id_post);
          }
        }
      } else {
        router.push("/login");
      }
    }
    getData();
  }, []);

  async function fetchPost(profile) {
    let id = params.url.split("-");
    id = id[id.length - 1];

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

    if (postsData.length == 0) {
      setPost([]);
      return null;
    }

    if (postsData[0].profile_id != profile.id_profile) {
      setPost([]);
      return null;
    }

    return postsData[0];
  }

  const handleFileChange = (event) => {
    const input = event.target;
    if (input.files.length > 0) {
      setFile(input.files[0]);
    } else {
      setFile(null);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (title == "") {
      setErrorTitle("Bitte gib einen Titel ein.");
      return;
    } else {
      setErrorTitle("");
    }

    let textInput = null;
    if (text != null || text != "") {
      textInput = text;
    }

    let fileUrl;
    if (typeof file !== "string" || !file instanceof String) {
      let fileName = oldFile.split("/")[oldFile.split("/").length - 1];

      const { data: oldFileData, error: oldFileError } = await supabase.storage
        .from("post-images")
        .remove([fileName]);

      if (oldFileError) {
        console.log(oldFileError);
        setErrorImage(
          "Beim Löschen des alten Bildes ist ein Fehler aufgetreten."
        );
        return;
      }

      const { error } = await supabase.storage
        .from("post-images")
        .upload(profile.username + "-" + file.name, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.log(error);
        setErrorImage("Beim Hochladen des Bildes ist ein Fehler aufgetreten.");
        return;
      }

      const { data: url } = supabase.storage
        .from("post-images")
        .getPublicUrl(profile.username + "-" + file.name);

      fileUrl = url.publicUrl;
    } else {
      fileUrl = file;
    }

    const { error } = await supabase
      .from("post")
      .update({
        title: title,
        content: textInput,
        profile_id: profile.id_profile,
        asset: fileUrl,
        edited: true,
      })
      .eq("id_post", postId);

    if (error) {
      console.log(error);
      setErrorImage("Beim aktualisiern des Posts ist ein Fehler aufgetreten.");
      return;
    }

    router.push("/");
  }

  return (
    <div className="mx-12 sm:mx-20 mt-8">
      <button
        className="btn-secondary items-center flex"
        onClick={() => router.back()}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text text-sm me-2" />
        Zurück
      </button>
      <form onSubmit={(e) => handleSubmit(e)} className="mt-8">
        <div>
          <label
            className={
              "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
              (errorTitle != "" ? " bg-error opacity-50" : " bg-primary ")
            }
            htmlFor="titel"
          >
            Titel
          </label>
          {errorTitle != "" && (
            <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
              {errorTitle}
            </div>
          )}
          <input
            className={
              "input w-full" +
              (errorTitle != ""
                ? " border-error rounded-b-form rounded-t-none"
                : "")
            }
            type="text"
            id="titel"
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mt-5">
          <label
            className={
              "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
              (errorText != "" ? " bg-error opacity-50" : " bg-primary ")
            }
            htmlFor="text"
          >
            Text
          </label>
          {errorText != "" && (
            <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
              {errorText}
            </div>
          )}
          <textarea
            className={
              "min-h-[45px] input w-full" +
              (errorText != ""
                ? " border-error rounded-b-form rounded-t-none"
                : "")
            }
            rows={5}
            id="text"
            type="text"
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="flex justify-between mt-5">
          <div className="flex flex-row items-center">
            <label
              htmlFor="fileInput"
              className="inline-block cursor-pointer px-5 py-2 btn-secondary text-sm"
            >
              <FontAwesomeIcon
                icon={faPlusSquare}
                className="h-3 w-3 me-1 mb-[1px]"
              />
              {file ? "Bild ändern" : "Bild hinzufügen"}
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <button className="btn-primary text text-sm" type="submit">
            Aktualisieren
          </button>
        </div>
        <p className="mt-2 text-xs text" id="fileName">
          {file ? file.name : ""}
        </p>
        {errorImage != "" && (
          <div className="bg-error font-bold mt-5 rounded-div px-3 py-2 text-text text text-sm">
            {errorImage}
          </div>
        )}
        <div className="mt-5">
          <img
            className="rounded-image"
            src={
              typeof file === "string" || file instanceof String
                ? file
                : URL.createObjectURL(file)
            }
          />
        </div>
      </form>
    </div>
  );
}
