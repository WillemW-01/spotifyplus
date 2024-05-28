import { useAuth } from "./AuthContext";
import { useGlobals } from "./Globals";

interface Error {
  error: {
    message: string;
    status: number;
  };
}

export function useRequestBuilder() {
  const { token } = useAuth();

  const catchError = async (response: Response, url: string) => {
    if (!response.ok) {
      console.log("Response came back with error code ", response.status);
      catchScopeError(response, url);
    }
  };

  const catchScopeError = async (response: Response, url: string) => {
    if (response.status === 403) {
      console.log(response);
      const error: Error = await response.json();
      console.log(error);
      if (error.error.message.includes("scope")) {
        console.error("Not authorized scope for url: ", url);
      }
    }
  };

  const headers = {
    get: {
      Authorization: `Bearer ${token}`,
    },
    put: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const buildGet = async (url: string): Promise<Response> => {
    const response = await fetch(url, {
      method: "GET",
      headers: headers.get,
    });

    await catchError(response, url);
    return response;
  };

  const buildPost = async (url: string) => {
    const response = await fetch(url, {
      method: "POST",
      headers: headers.get,
    });

    await catchError(response, url);
    return response;
  };

  const buildPut = async (url: string, body: unknown): Promise<Response> => {
    const response = await fetch(url, {
      method: "PUT",
      headers: headers.put,
      body: JSON.stringify(body),
    });

    await catchError(response, url);
    return response;
  };

  return {
    buildGet,
    buildPost,
    buildPut,
  };
}
