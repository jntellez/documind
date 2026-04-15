import type { AuthProvider, LoginResponse } from "@documind/types";
import { sign } from "hono/jwt";
import { config } from "../config";
import sql from "../db";
import { verifyGithubCode } from "../lib/github";
import { verifyGoogleCode } from "../lib/google";

export const AuthService = {
  async authenticate(
    provider: AuthProvider,
    code: string,
    redirectUri?: string,
    codeVerifier?: string,
  ): Promise<LoginResponse> {
    let userInfo;

    if (provider === "google") {
      userInfo = await verifyGoogleCode(code, redirectUri);
    } else if (provider === "github") {
      userInfo = await verifyGithubCode(code, redirectUri, codeVerifier);
    } else {
      throw new Error("Proveedor no soportado");
    }

    const [user] = await sql`
      INSERT INTO users (email, name, avatar_url, provider, provider_id)
      VALUES (
        ${userInfo.email},
        ${userInfo.name},
        ${userInfo.avatarUrl},
        ${provider},
        ${userInfo.providerId}
      )
      ON CONFLICT (email) DO UPDATE
      SET
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        provider = EXCLUDED.provider,
        provider_id = EXCLUDED.provider_id
      RETURNING id, email, name, avatar_url
    `;

    const payload = {
      sub: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 28,
    };

    const token = await sign(payload, config.jwtSecret);

    return { user, token };
  },

  async deleteAccount(userId: number) {
    const [deleted] = await sql`
      DELETE FROM users WHERE id = ${userId} RETURNING id
    `;

    if (!deleted) {
      throw new Error("Usuario no encontrado");
    }

    return { success: true };
  },
};
