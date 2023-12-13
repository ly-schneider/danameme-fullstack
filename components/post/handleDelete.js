import supabase from "../supabase";

export async function handlePostDelete(id) {
  const { data: imageUrl, error: imageError } = await supabase
    .from("post")
    .select("asset")
    .eq("id_post", id)
    .single();

  if (imageError) {
    console.log(imageError);
    return;
  }

  if (imageUrl.asset) {
    let imagePath = imageUrl.asset.split("/");
    imagePath = imagePath[imagePath.length - 1];

    const { error: imageDeleteError } = await supabase.storage
      .from("post-images")
      .remove(imagePath);

    if (imageDeleteError) {
      console.log(imageDeleteError);
      return;
    }
  }

  const { error } = await supabase.from("post").delete().eq("id_post", id);

  if (error) {
    console.log(error);
    return;
  }
}
