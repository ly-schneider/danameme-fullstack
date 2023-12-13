import supabase from "../supabase";

export async function handleCommentDelete(id) {
  const { error } = await supabase
    .from("comment")
    .delete()
    .eq("id_comment", id);

  if (error) {
    console.log(error);
    return;
  }
}
