export function calcTime(dateInput) {
  const date = new Date(dateInput);
  const dateStringCustom = `${date.toLocaleDateString("de-DE", {
    day: "numeric",
  })}. ${date.toLocaleDateString("de-DE", {
    month: "long",
  })} ${date.toLocaleDateString("de-DE", { year: "numeric" })}, ${
    date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
  }:${
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
  } Uhr`;

  return dateStringCustom;
}
