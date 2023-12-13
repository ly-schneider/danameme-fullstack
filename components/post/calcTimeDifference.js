export function calcTimeDifference(date) {
  const targetDateTime = new Date(date);
  const currentDateTime = new Date();

  const timeDifference = currentDateTime - targetDateTime;

  const secondsDifference = Math.floor(timeDifference / 1000);

  if (secondsDifference < 60) {
    return `vor ${secondsDifference} Sekunde${
      secondsDifference !== 1 ? "n" : ""
    }`;
  } else if (secondsDifference < 3600) {
    const minutes = Math.floor(secondsDifference / 60);
    return `vor ${minutes} Minute${minutes !== 1 ? "n" : ""}`;
  } else if (secondsDifference < 86400) {
    const hours = Math.floor(secondsDifference / 3600);
    return `vor ${hours} Stude${hours !== 1 ? "n" : ""}`;
  } else if (secondsDifference < 604800) {
    const days = Math.floor(secondsDifference / 86400);
    return `vor ${days} Tag${days !== 1 ? "en" : ""}`;
  } else if (secondsDifference < 2419200) {
    const weeks = Math.floor(secondsDifference / 604800);
    return `vor ${weeks} Woche${weeks !== 1 ? "n" : ""}`;
  } else if (secondsDifference < 29030400) {
    const months = Math.floor(secondsDifference / 2419200);
    return `vor ${months} Monat${months !== 1 ? "en" : ""}`;
  }
}
