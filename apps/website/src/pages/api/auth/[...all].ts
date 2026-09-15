import type { APIRoute } from "astro";
import { handleAuthRequest } from "@/lib/auth-server";

export const prerender = false;

export const GET: APIRoute = ({ request }) => handleAuthRequest(request);
export const POST: APIRoute = ({ request }) => handleAuthRequest(request);
