import supabase from "../supabase";

export async function handleVote(postId, type, profileId) {
  const { data, error } = await supabase
    .from("rating_post")
    .select("*")
    .eq("post_id", postId)
    .eq("profile_id", profileId);

  if (error) {
    console.log(error);
    return;
  }

  console.log(data);

  const { data: postUser, error: postUserError } = await supabase
    .from("post")
    .select("profile_id")
    .eq("id_post", postId);

  if (postUserError) {
    console.log(postUserError);
    return;
  }

  console.log(postUser)

  const { data: userKarma, error: userKarmaError } = await supabase
    .from("profile")
    .select("karma")
    .eq("id_profile", postUser[0].profile_id);

  if (userKarmaError) {
    console.log(userKarmaError);
    return;
  }

  console.log(userKarma)

  let karma = userKarma[0].karma;
  if (data.length == 0) {
    const { error } = await supabase.from("rating_post").insert({
      post_id: postId,
      profile_id: profileId,
      type: type,
    });

    if (error) {
      console.log(error);
      return;
    }

    if (type) {
      karma += 1;
    } else {
      karma -= 1;
    }
  } else {
    if (data[0].type == type) {
      const { error } = await supabase
        .from("rating_post")
        .delete()
        .eq("id_ratingpost", data[0].id_ratingpost);

      if (error) {
        console.log(error);
        return;
      }

      if (type) {
        karma -= 1;
      } else {
        karma += 1;
      }
    } else {
      const { error } = await supabase
        .from("rating_post")
        .update({ type: type })
        .eq("id_ratingpost", data[0].id_ratingpost);

      if (error) {
        console.log(error);
        return;
      }

      if (type) {
        karma += 2;
      } else {
        karma -= 2;
      }
    }
  }

  console.log(profileId)

  console.log(karma)

  if (karma < 0) {
    karma = 0;
  }

  console.log(postUser[0].profile_id)
  if (profileId != postUser[0].profile_id) {
    const { error: updateKarmaError } = await supabase
      .from("profile")
      .update({ karma: karma })
      .eq("id_profile", postUser[0].profile_id);

    if (updateKarmaError) {
      console.log(updateKarmaError);
      return;
    }
  }

  return true;
}
