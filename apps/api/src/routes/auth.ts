import type { LoginRequest } from "@documind/types";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { z } from "zod";
import { config } from "../config";
import { AuthService } from "../services/auth.service";

const auth = new Hono();
const authJwt = jwt({ secret: config.jwtSecret, alg: "HS256" });

type JwtPayload = {
  sub?: string | number;
  id?: string | number;
};

const LoginRequestSchema = z.object({
  code: z.string().min(1, "Code is required"),
  provider: z.enum(["google", "github"]),
  redirectUri: z.string().min(1).optional(),
  codeVerifier: z.string().min(1).optional(),
}) satisfies z.ZodType<LoginRequest>;

auth.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { code, provider, redirectUri, codeVerifier } =
      LoginRequestSchema.parse(body);

    const result = await AuthService.authenticate(
      provider,
      code,
      redirectUri,
      codeVerifier,
    );

    return c.json(result);
  } catch (error) {
    console.error("Login Error:", error);
    return c.json(
      {
        error:
          error instanceof z.ZodError
            ? "Faltan parámetros (code, provider)"
            : "Error durante la autenticación",
        details: String(error),
      },
      400,
    );
  }
});

auth.delete("/delete-account", authJwt, async (c) => {
  try {
    const payload = c.get("jwtPayload") as JwtPayload;
    const userId = Number(payload.sub || payload.id);

    const result = await AuthService.deleteAccount(userId);
    return c.json(result);
  } catch (error) {
    console.error("Delete Account Error:", error);
    return c.json(
      { error: "Error al eliminar la cuenta", details: String(error) },
      400,
    );
  }
});

export default auth;
