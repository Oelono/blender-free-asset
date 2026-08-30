/**
 * Decap CMS ↔ GitHub OAuth proxy — for use with GitHub Pages.
 *
 * SETUP
 * 1) Create a GitHub OAuth App:
 *    https://github.com/settings/developers -> "New OAuth App"
 *      Homepage URL:            https://YOUR_USERNAME.github.io/YOUR_REPO
 *      Authorization callback:  https://YOUR-WORKER-SUBDOMAIN.workers.dev/callback
 *    Copy the Client ID and generate a Client Secret.
 *
 * 2) Cloudflare dashboard -> Workers & Pages -> Create -> Create Worker.
 *    Paste this whole file in, replacing the default code, then Deploy.
 *
 * 3) Worker -> Settings -> Variables -> add two secrets:
 *      GITHUB_CLIENT_ID     = (from step 1)
 *      GITHUB_CLIENT_SECRET = (from step 1)
 *
 * 4) In admin/config.yml, set:
 *      base_url: https://YOUR-WORKER-SUBDOMAIN.workers.dev
 *      auth_endpoint: auth
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
      authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      authorizeUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
      authorizeUrl.searchParams.set("scope", "repo,user");
      return Response.redirect(authorizeUrl.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Missing code", { status: 400 });
      }

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        return new Response(`OAuth error: ${tokenData.error_description || tokenData.error}`, {
          status: 400,
        });
      }

      const payload = JSON.stringify({
        token: tokenData.access_token,
        provider: "github",
      });

      const html = `<!DOCTYPE html>
<html><body>
<script>
  (function() {
    function receiveMessage(e) {
      window.opener.postMessage(
        'authorization:github:success:${payload.replace(/'/g, "\\'")}',
        e.origin
      );
      window.removeEventListener("message", receiveMessage, false);
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  })();
</script>
Login successful, you can close this window.
</body></html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Decap CMS GitHub OAuth proxy is running.", { status: 200 });
  },
};
