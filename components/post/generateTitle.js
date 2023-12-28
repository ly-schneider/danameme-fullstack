export function generateTitle(post) {
  let title = post.title;
  let newTitle;

  if (title == null) {
    newTitle = "post";
  } else {
    newTitle = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }

  if (newTitle.substring(newTitle.length - 1) == "-") {
    newTitle = newTitle.substring(0, newTitle.length - 1);
  }

  if (newTitle.length > 20) {
    newTitle = newTitle.substring(0, 20);
  }
  return newTitle + "-" + post.id_post;
}
