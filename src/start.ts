import { createStart, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const publicApiMiddleware = createMiddleware({ type: "request" }).server(async ({ next }) => {
  const request = getRequest();
  if (request) {
    try {
      const { handlePublicApi } = await import("./lib/public-api.server");
      const res = await handlePublicApi(request);
      if (res) return res;
    } catch (error) {
      console.error(error);
    }
  }
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, publicApiMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
