"use client";

import { calcTimeDifference } from "@/components/post/calcTimeDifference";
import supabase from "@/components/supabase";
import { useEffect, useState } from "react";

export default function ChangelogsPage() {
  const [changelogs, setChangelogs] = useState([]);

  useEffect(() => {
    getLogs();
  }, []);

  async function getLogs() {
    const { data, error } = await supabase
      .from("changelog")
      .select(
        "id_changelog, createdat, title, text, type_id, changelog_type (id_type, text, class)"
      )
      .order("createdat", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    console.log(data);
    setChangelogs(data);
  }

  return (
    <div className="mt-8 mx-5 sm:mx-0">
      <h1 className="title">Change Logs</h1>
      <div className="flex flex-col space-y-5 mt-8">
        {changelogs.map((log) => (
          <div
            key={log.id_changelog}
            className="flex flex-col bg-[#1F1F1F] px-4 sm:px-6 py-5 rounded-changelog"
          >
            <div className="flex flex-row justify-between flex-wrap gap-4">
              <h1 className="font-semibold title text-xl">{log.title}</h1>
              <span
                className={
                  log.changelog_type.class +
                  " rounded-[5px] px-3 py-1 w-auto text-sm text"
                }
              >
                {log.changelog_type.text}
              </span>
            </div>
            <p className="text mt-5 mr-0 sm:mr-8">{log.text}</p>
            <p className="text-muted text text-xs text-end mt-3">
              {calcTimeDifference(log.createdat)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
