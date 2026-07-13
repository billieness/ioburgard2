// /io-burgard/api/auth.js
export default function handler(req, res) {
  const { code } = req.query;

  // Si on reçoit un code (retour de GitHub), redirige vers /api/callback
  if (code) {
    return res.redirect(307, `/api/callback?code=${code}`);
  }

  // Sinon, redirige vers GitHub pour l'autorisation
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    `${process.env.VERCEL_URL || 'https://ioburgard2-qn1sf69cf-billieness-projects.vercel.app'}/api/callback`
  );
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=repo`;

  return res.redirect(307, githubAuthUrl);
}
