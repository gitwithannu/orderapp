export function getUser() {
  if (typeof window === "undefined") return null;

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("client_token="))
    ?.split("=")[1];

    console.log(" =================user token ============");
    console.log(token)

  if (!token) return null;

  try {
    console.log(' ================ get_user.ts =============');
    console.log(token)
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (err) {
    return null;
  }
}
