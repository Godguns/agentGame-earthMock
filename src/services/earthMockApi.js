const API_BASE_URL = (
  import.meta.env.VITE_EARTH_MOCK_API_BASE_URL 
).replace(/\/$/, "");

function buildErrorMessage(data, fallback) {
  if (!data) {
    return fallback;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join("; ");
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  return fallback;
}

async function request(path, options = {}) {
  const {
    body,
    token,
    headers: customHeaders,
    ...fetchOptions
  } = options;
  const headers = new Headers(customHeaders || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let payload = body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
    body: payload,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const error = new Error(
      buildErrorMessage(data, `Request failed with ${response.status}`),
    );
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}

export function registerAccount(payload) {
  return request("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginAccount(payload) {
  return request("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function fetchCurrentUser(token) {
  return request("/auth/me", {
    method: "GET",
    token,
  });
}

export function bindPersonaProfile(profile, token) {
  return request("/persona/bind", {
    method: "PUT",
    token,
    body: profile,
  });
}

export function fetchPersona(token) {
  return request("/persona/me", {
    method: "GET",
    token,
  });
}

export function fetchInternalUsers(token) {
  return request("/internal/users", {
    method: "GET",
    token,
  });
}

export function sendPlayerReply(payload, token) {
  return request("/messages/reply", {
    method: "POST",
    token,
    body: payload,
  });
}

export function pollMessages({ since, channel, limit = 50 } = {}, token) {
  const params = new URLSearchParams();

  if (since) {
    params.set("since", since);
  }

  if (channel) {
    params.set("channel", channel);
  }

  params.set("limit", String(limit));

  return request(`/messages/poll?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export function triggerRandomMessage(token) {
  return request("/messages/trigger/random", {
    method: "POST",
    token,
  });
}

export function fetchStoryState(token) {
  return request("/story/state", {
    method: "GET",
    token,
  });
}

export function fetchStoryBranches(token) {
  return request("/story/branches", {
    method: "GET",
    token,
  });
}

export function startStoryBranch(branchKey, token) {
  return request("/story/start", {
    method: "POST",
    token,
    body: { branch_key: branchKey },
  });
}

export function submitStoryChoice(choiceKey, token) {
  return request("/story/choice", {
    method: "POST",
    token,
    body: { choice_key: choiceKey },
  });
}

export function fetchWorldState(token) {
  return request("/world/state", {
    method: "GET",
    token,
  });
}

export function submitWorldAction(actionKey, token) {
  return request("/world/action", {
    method: "POST",
    token,
    body: { action_key: actionKey },
  });
}

export function createMessageStream(token, { channel, onMessages, onError } = {}) {
  if (!token || typeof EventSource === "undefined") {
    return null;
  }

  const params = new URLSearchParams({ access_token: token });
  if (channel) {
    params.set("channel", channel);
  }

  const stream = new EventSource(`${API_BASE_URL}/messages/stream?${params}`);

  stream.addEventListener("messages", (event) => {
    try {
      const payload = JSON.parse(event.data);
      onMessages?.(payload);
    } catch (error) {
      onError?.(error);
    }
  });

  stream.addEventListener("error", (event) => {
    onError?.(event);
  });

  return stream;
}
