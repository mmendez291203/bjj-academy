/**
 * Route handler para NextAuth v5 (Auth.js)
 *
 * Este archivo expone los endpoints:
 * GET/POST /api/auth/session
 * GET/POST /api/auth/signin
 * GET/POST /api/auth/signout
 * GET/POST /api/auth/callback/:provider
 * GET      /api/auth/csrf
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
