export async function sendVisitorNotification() {
  try {
    await fetch("/api/notify", {
      method: "POST",
    });
  } catch (error) {
    console.error(error);
  }
}