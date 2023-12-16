"use client";

import { calcTimeDifference } from "@/components/post/calcTimeDifference";
import supabase from "@/components/supabase";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [filter, setFilter] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
    setFilter("newest");
  }, []);

  useEffect(() => {
    getUsers();
  }, [filter]);

  useEffect(() => {
    console.log(users);
  }, [users]);

  async function getUsers() {
    switch (filter) {
      case "karma":
        getUsersByKarma();
        break;
      case "oldest":
        getUsersByOldest();
        break;
      case "newest":
        getUsersByNewest();
        break;
      default:
        getUsersByNewest();
    }
  }

  async function getUsersByKarma() {
    const { data, error } = await supabase
      .from("profile")
      .select("*, account (createdat)")
      .order("karma", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setUsers(data);
  }

  async function getUsersByOldest() {
    const { data, error } = await supabase
      .from("profile")
      .select("*, account (createdat)")
      .order("account (createdat)", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setUsers(data);
  }

  async function getUsersByNewest() {
    const { data, error } = await supabase
      .from("profile")
      .select("*, account (createdat)")
      .order("account (createdat)", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setUsers(data);
  }

  function calcTime(dateInput) {
    const date = new Date(dateInput);
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

  return (
    <div className="mt-8 mx-5 sm:mx-0">
      <h1 className="title ">Alle Benutzer</h1>
      <div className="mt-5">
        <p className="text font-semibold">Filter</p>
        <div className="flex flex-row flex-wrap gap-3 mt-2 w-full">
          <div
            onClick={() => setFilter("newest")}
            className={
              (filter == "newest"
                ? " bg-accent text-text"
                : " bg-muted text-[#101010] hover:bg-accent hover:text-text hover:cursor-pointer") +
              " px-4 py-2 text text-sm rounded-md transition-all duration-300"
            }
          >
            Neuste Benutzer
            {filter == "newest" && (
              <FontAwesomeIcon
                icon={faXmark}
                className="ml-2 hover:cursor-pointer"
              />
            )}
          </div>
          <div
            onClick={() => setFilter("oldest")}
            className={
              (filter == "oldest"
                ? " bg-accent text-text"
                : " bg-muted text-[#101010] hover:bg-accent hover:text-text hover:cursor-pointer") +
              " px-4 py-2 text text-sm rounded-md transition-all duration-300"
            }
          >
            Älteste Benutzer
            {filter == "oldest" && (
              <FontAwesomeIcon
                icon={faXmark}
                className="ml-2 hover:cursor-pointer"
              />
            )}
          </div>
          <div
            onClick={() => setFilter("karma")}
            className={
              (filter == "karma"
                ? " bg-accent text-text"
                : " bg-muted text-[#101010] hover:bg-accent hover:text-text hover:cursor-pointer") +
              " px-4 py-2 text text-sm rounded-md transition-all duration-300"
            }
          >
            Meisten Karma
            {filter == "karma" && (
              <FontAwesomeIcon
                icon={faXmark}
                className="ml-2 hover:cursor-pointer"
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col space-y-4">
        {users.map((user) => (
          <div key={user.id_profile}>
            <Link href={`/p/${user.username}`}>
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row items-center space-x-4">
                  <img
                    src={user.profileimage}
                    className="w-10 h-10 rounded-full object-cover border-2 border-accent"
                    alt="avatar"
                  />
                  <div className="flex flex-col">
                    <p className="font-semibold text text-lg">
                      {user.username}
                    </p>
                    <p className="text-muted text-sm text">
                      Beigetreten: {calcTime(user.account.createdat)}
                    </p>
                  </div>
                </div>
                <p className="text-muted text-sm">Karma: {user.karma}</p>
              </div>
            </Link>
            <hr className="border-muted border-opacity-20 mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
