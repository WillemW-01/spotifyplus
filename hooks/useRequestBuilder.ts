import { useGlobals } from "./Globals";

export function useRequestBuilder() {
  const { token } = useGlobals();

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

    return response;
  };

  const buildPost = async () => {};

  const buildPut = async (url: string, body: unknown): Promise<Response> => {
    const response = await fetch(url, {
      method: "PUT",
      headers: headers.put,
      body: JSON.stringify(body),
    });

    return response;
  };

  return {
    buildGet,
    buildPost,
    buildPut,
  };
}
