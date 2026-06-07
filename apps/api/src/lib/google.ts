import { config } from "../config";

const resolveAllowedGoogleClientId = (clientId?: string) => {
  if (!clientId) {
    return config.google.clientId;
  }

  if (!config.google.allowedClientIds.includes(clientId)) {
    throw new Error("Google client is not allowed");
  }

  return clientId;
};

export const verifyGoogleCode = async (
  code: string,
  redirectUri?: string,
  codeVerifier?: string,
  clientId?: string,
) => {
  const resolvedClientId = resolveAllowedGoogleClientId(clientId);
  const isNativePkceFlow =
    Boolean(codeVerifier) && resolvedClientId !== config.google.clientId;

  const params: Record<string, string> = {
    code,
    client_id: resolvedClientId,
    redirect_uri: redirectUri || "",
    grant_type: "authorization_code",
  };

  if (codeVerifier) {
    params.code_verifier = codeVerifier;
  }

  if (!isNativePkceFlow) {
    params.client_secret = config.google.clientSecret;
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });

  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    throw new Error(
      `Google Auth Failed: ${
        tokens.error_description || tokens.error || "No access token"
      }`,
    );
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const userData = await userRes.json();

  return {
    providerId: userData.id,
    email: userData.email,
    name: userData.name,
    avatarUrl: userData.picture,
  } as const;
};
