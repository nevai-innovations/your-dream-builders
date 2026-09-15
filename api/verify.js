// Lets the update page confirm a password is correct before unlocking the
// dashboard, rather than only finding out on the first real upload.
import { checkPassword } from "./_manifest.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!checkPassword(req)) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }
  res.status(200).json({ ok: true });
}
