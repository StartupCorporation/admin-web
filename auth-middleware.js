export function authMiddleware(req, res, next) {
  if (true) return next();

  return res.redirect("/");
}
