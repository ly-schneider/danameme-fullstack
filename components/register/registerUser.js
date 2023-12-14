"use client";

import { useEffect, useState } from "react";
import supabase from "../supabase";

export default async function registerUser(formData, badgeList, setError) {
  const insertStatus = await insertUser(formData);
  if (insertStatus == "Es gab einen Fehler beim schreiben in die Datenbank!") {
    setError(insertStatus);
    cleanUp(formData);
    return false;
  }

  const user = await getUser(formData);
  if (user == "Es gab einen Fehler beim lesen aus der Datenbank!") {
    setError(user);
    cleanUp(formData);
    return false;
  }

  const insertProfile = await insertProfileInto(user.id_account, formData);
  if (
    insertProfile == "Es gab einen Fehler beim lesen aus der Datenbank!" ||
    insertProfile == "Es gab einen Fehler beim schreiben in die Datenbank!"
  ) {
    setError(insertProfile);
    cleanUp(formData);
    return false;
  }

  const profile = await getProfile(formData);
  if (profile == "Es gab einen Fehler beim lesen aus der Datenbank!") {
    setError(profile);
    cleanUp(formData);
    return false;
  }

  const insertBadge = await insertBadgeInto(
    profile.id_profile,
    badgeList,
    insertProfile
  );
  if (insertBadge == "Es gab einen Fehler beim schreiben in die Datenbank!") {
    setError(insertBadge);
    cleanUp(formData);
    return false;
  }

  return true;
}

async function cleanUp(formData) {
  const { error } = await supabase
    .from("account")
    .delete()
    .eq("email", formData.email);

  if (error) {
    console.log(error);
    return "Es gab einen Fehler beim löschen aus der Datenbank!";
  }

  return true;
}

async function insertUser(formData) {
  const { error } = await supabase.from("account").insert({
    firstname: formData.firstname,
    lastname: formData.lastname,
    email: formData.email,
  });

  if (error) {
    console.log(error);
    return "Es gab einen Fehler beim schreiben in die Datenbank!";
  }

  return true;
}

async function getUser(formData) {
  const { data, error } = await supabase
    .from("account")
    .select("id_account")
    .eq("email", formData.email)
    .single();

  if (error) {
    console.log(error);
    return "Es gab einen Fehler beim lesen aus der Datenbank!";
  }

  return data;
}

async function insertProfileInto(id_account, formData) {
  const { data: userCountData, error: getError } = await supabase
    .from("profile")
    .select("userCount")
    .order("userCount", { ascending: false });

    console.log(userCountData)

  if (getError) {
    console.log(getError);
    return "Es gab einen Fehler beim lesen aus der Datenbank!";
  }

  const defaultProfileImages = [
    "/defaultProfileImages/pepo-aww.jpeg",
    "/defaultProfileImages/pepo-clown.jpeg",
    "/defaultProfileImages/pepo-idea.jpeg",
    "/defaultProfileImages/pepo-straight.jpeg",
  ];

  const randomIndex = Math.floor(Math.random() * defaultProfileImages.length);
  const randomImage = defaultProfileImages[randomIndex];

  let userCount = userCountData;
  console.log(userCount)
  if (userCount.length == 0) {
    userCount = 1;
  } else {
    userCount = userCountData[0].userCount + 1;
  }

  console.log(userCount)

  const { error } = await supabase.from("profile").insert({
    username: formData.username,
    account_id: id_account,
    userCount: userCount,
    profileimage: randomImage,
  });

  if (error) {
    console.log(error);
    return "Es gab einen Fehler beim schreiben in die Datenbank!";
  }

  return userCount.userCount + 1;
}

async function getProfile(formData) {
  const { data, error } = await supabase
    .from("profile")
    .select("id_profile")
    .eq("username", formData.username)
    .single();

  if (error) {
    console.log(error);
    return "Es gab einen Fehler beim lesen aus der Datenbank!";
  }

  return data;
}

async function insertBadgeInto(id_profile, badgeList, userCount) {
  if (userCount <= 10) {
    badgeList.push(7);
  } else if (userCount <= 100) {
    badgeList.push(8);
  } else if (userCount <= 200) {
    badgeList.push(9);
  }
  let errorText = "";
  badgeList.map(async (badge) => {
    const { error } = await supabase.from("profile_badge").insert({
      profile_id: id_profile,
      badge_id: badge,
    });

    if (error) {
      console.log(error);
      errorText = "Es gab einen Fehler beim schreiben in die Datenbank!";
    }
  });

  if (errorText != "") {
    return errorText;
  }
  return true;
}
