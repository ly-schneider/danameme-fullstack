import supabase from "../supabase";

export default async function followProfile(
  profileId,
  profileSessionId,
  isFollowing
) {
  if (isFollowing) {
    const { error } = await supabase
      .from("follower")
      .delete()
      .eq("profile_id", profileId)
      .eq("follower_id", profileSessionId);

    if (error) {
      console.log(error);
      return false;
    }

    return true;
  }

  const { error } = await supabase.from("follower").insert([
    {
      profile_id: profileId,
      follower_id: profileSessionId,
    },
  ]);

  if (error) {
    console.log(error);
    return false;
  }

  const { error: notificationError } = await supabase
    .from("notification")
    .insert([
      {
        toprofile_id: profileId,
        fromprofile_id: profileSessionId,
        text: "folgt dir jetzt!",
        seen: false,
      },
    ]);

  if (notificationError) {
    console.log(notificationError);
    return false;
  }

  return true;
}
