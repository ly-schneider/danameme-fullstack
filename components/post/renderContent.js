export default function renderContent(content) {
  const linkRegex = /(http[s]?:\/\/[^\s]+)/g;

  const containsLink = linkRegex.test(content);

  if (containsLink) {
    return (
      <a className="text underline" target="_blank" href={content}>
        {content}
      </a>
    );
  } else {
    return <p className="text whitespace-pre-line">{content}</p>;
  }
}
