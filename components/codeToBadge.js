"use client";

import supabase from "./supabase";

export default async function CodeToBadge(code) {
  const { data: dataCode, error: errorCode } = await supabase
    .from("code")
    .select("id_code")
    .eq("code", code)
    .single();

  if (errorCode) {
    console.log(errorCode);
    return false;
  }

  if (dataCode.length == 0) {
    return "ungültig";
  }

  // This object turns the code id into a badge id
  const badgeList = {
    1: 1,
    2: 6,
    3: 5,
    4: 3,
    5: 4,
  };

  if (badgeList[dataCode.id_code] == undefined) {
    return "ungültig";
  }

  const { data, error } = await supabase
    .from("badge")
    .select("*")
    .eq("id_badge", badgeList[dataCode.id_code])
    .single();

  if (error) {
    console.log(error);
    return false;
  }

  return data;
}
