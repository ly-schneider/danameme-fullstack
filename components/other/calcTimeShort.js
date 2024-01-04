export default function calcTimeShort(time) {
    const date = new Date(time);
    const unix = date.getTime();
    const now = new Date();

    const years = Math.floor((now - date) / 31536000000);
    const months = Math.floor((now - date) / 2592000000);
    const weeks = Math.floor((now - date) / 604800000);
    const days = Math.floor((now - date) / 86400000);
    const hours = Math.floor((now - date) / 3600000);
    const minutes = Math.floor((now - date) / 60000);

    if (years > 0) {
        return `${years} Jahr${years > 1 ? 'e' : ''}`;
    } else if (months > 0) {
        return `${months} Monat${months > 1 ? 'e' : ''}`;
    } else if (weeks > 0) {
        return `${weeks} Woche${weeks > 1 ? 'n' : ''}`;
    } else if (days > 0) {
        return `${days} Tag${days > 1 ? 'e' : ''}`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${unix}s`;
    }
}