export async function registerVisitor() {
  await fetch("/api/visitor", {
    method: "POST",
  });
}

export async function getVisitorCount() {
  const res = await fetch("/api/visitor");

  return res.json();
}