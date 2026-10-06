const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  try {
    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      ...options,
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();

      throw new Error(
        `API returned a non-JSON response (${response.status}). ` +
          `Backend: ${API_URL}. ` +
          (text ? text.slice(0, 160) : "")
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot reach the GrowAIs backend at ${API_URL}. ` +
          `Make sure the backend is running on port 5000 and CORS allows http://localhost:3000.`
      );
    }

    throw error;
  }
}
