import { useAuth } from "./AuthContext";
import { useGlobals } from "./Globals";
import useSpotifyAuth from "./useSpotifyAuth";

interface Error {
  error: {
    message: string;
    status: number;
  };
}

export function useRequestBuilder() {
  const { token, shouldRefresh } = useAuth();
  const { refreshAccessToken } = useSpotifyAuth();

  const catchError = async (response: Response, url: string) => {
    if (!response.ok) {
      console.log("Response came back with error code ", response.status);
      const error: Error = await response.json();
      console.log(error);
      catchScopeError(response, error, url);
    }
  };

  const catchScopeError = async (
    response: Response,
    error: Error,
    url: string
  ) => {
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
    if (token && (await shouldRefresh())) {
      await refreshAccessToken(token);
    }
  };

  const build = async (
    method: "GET" | "POST" | "PUT",
    url: string,
    body?: unknown
  ) => {
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
    // await checkForRefresh();

    // const response = await fetch(url, {
    //   method: "GET",
    //   headers: headers.get,
    // });

    // await catchError(response, url);
    // return response;
  };

  const buildPost = async (url: string) => {
    return await build("POST", url);
    // await checkForRefresh();

    // const response = await fetch(url, {
    //   method: "POST",
    //   headers: headers.get,
    // });

    // await catchError(response, url);
    // return response;
  };

  const buildPut = async (url: string, body: unknown): Promise<Response> => {
    return await build("PUT", url, body);
    // await checkForRefresh();

    // const response = await fetch(url, {
    //   method: "PUT",
    //   headers: headers.put,
    //   body: JSON.stringify(body),
    // });

    // await catchError(response, url);
    // return response;
  };

  return {
    buildGet,
    buildPost,
    buildPut,
  };
}
