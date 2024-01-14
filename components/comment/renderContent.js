export default function renderContentComment(text) {
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const mentionRegex = /@([^\s]+)/g;

  const textWithLinks = text.replace(
    linkRegex,
    '<a href="$1" class="underline" target="_blank">$1</a>'
  );
  const textWithMentions = textWithLinks.replace(
    mentionRegex,
    '<a href="/p/$1" class="font-bold" target="_blank">@$1</a>'
  );

  const finalHTML = `<p class="text ms-14 whitespace-pre-line">${textWithMentions}</p>`;

  // Use dangerouslySetInnerHTML to render HTML content in React (use with caution)
  return { __html: finalHTML };
}
