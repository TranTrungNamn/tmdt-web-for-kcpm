const apiBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    // Tự động fallback theo API_BASE_URL nếu không khai báo GOOGLE_REDIRECT_URI riêng:
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${apiBase.replace(/\/$/, '')}/api/auth/google/callback`,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
    scopes: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  }
};

module.exports = { oauthConfig };
