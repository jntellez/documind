import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { config } from "../../config";
import { registerCrudDocumentRoutes } from "./crud.routes";
import processDocumentRoutes from "./process.routes";

const documentRoutes = new Hono();
const authJwt = jwt({ secret: config.jwtSecret, alg: "HS256" });

documentRoutes.route("/", processDocumentRoutes);
documentRoutes.route("/", registerCrudDocumentRoutes(authJwt));

export default documentRoutes;
