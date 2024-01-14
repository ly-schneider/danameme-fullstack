import supabase from "../supabase";

export async function addComment(profileIdPost, postId, text, profileId) {
  const { error: commentError } = await supabase.from("comment").insert({
    text: text,
    profile_id: profileId,
    post_id: postId,
  });

  if (commentError) {
    console.log(commentError);
    return;
  }

  const { data: commentId, error: commentIdError } = await supabase
    .from("comment")
    .select("id_comment")
    .eq("text", text)
    .eq("profile_id", profileId)
    .eq("post_id", postId);

  if (commentIdError) {
    console.log(commentIdError);
    return;
  }

  const { error: notificationError } = await supabase
    .from("notification")
    .insert({
      toprofile_id: profileIdPost,
      fromprofile_id: profileId,
      text: `hat deinem Beitrag ein Kommentar hinzugefügt`,
      comment_id: commentId[0].id_comment,
    });

  if (notificationError) {
    console.log(notificationError);
    return;
  }

  const regex = /@([a-zA-Z0-9_]+)/g;
  const matches = text.match(regex);

  if (matches) {
    const usernames = matches.map((match) => match.replace("@", ""));

    usernames.forEach(async (username) => {
      const { data: profileData } = await supabase
        .from("profile")
        .select("id_profile")
        .eq("username", username);

      if (profileData.length > 0) {
        const { error: createNotificationError } = await supabase
          .from("notification")
          .insert({
            toprofile_id: profileData[0].id_profile,
            fromprofile_id: profileId,
            text: "hat dich in einem Kommentar erwähnt",
            seen: false,
            comment_id: commentId[0].id_comment,
          });

        if (createNotificationError) {
          console.log(createNotificationError);
          return;
        }
      }
    });
  }

  return true;
}
