import { useAuth } from "./AuthContext";

interface Error {
  error: {
    message: string;
    status: number;
  };
}

export function useRequestBuilder() {
  const { token, refreshToken, shouldRefresh, refreshAccessToken } = useAuth();

  const catchError = async (response: Response, url: string) => {
    if (!response.ok) {
      console.log("Response came back with error code ", response.status);
      const error: Error = await response.json();
      console.log(error);
      catchScopeError(response, error, url);
    }
  };

  const catchScopeError = async (response: Response, error: Error, url: string) => {
    if (response.status === 403) {
      console.log(response);

      if (error.error.message.includes("scope")) {
        console.error("Not authorized scope for url: ", url);
      }
    }
  };

  const headers = {
    GET: {
      Authorization: `Bearer ${token}`,
    },
    PUT: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    POST: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const checkForRefresh = async () => {
    if (token && refreshToken && (await shouldRefresh())) {
      await refreshAccessToken(refreshToken);
    }
  };

  const build = async (method: "GET" | "POST" | "PUT", url: string, body?: unknown) => {
    await checkForRefresh();
    const response = await fetch(url, {
      method: method,
      headers: headers[method],
      body: body ? JSON.stringify(body) : undefined,
    });
    await catchError(response, url);
    return response;
  };

  const buildGet = async (url: string): Promise<Response> => {
    return await build("GET", url);
  };

  const buildPost = async (url: string) => {
    return await build("POST", url);
  };

  const buildPut = async (url: string, body: unknown): Promise<Response> => {
    return await build("PUT", url, body);
  };

  return {
    buildGet,
    buildPost,
    buildPut,
  };
}
