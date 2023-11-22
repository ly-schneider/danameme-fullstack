export default async function BackendContent() {
  try {
    const response = await fetch("http://localhost:8080/account/all");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
