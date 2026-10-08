export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const logout = () => {
  localStorage.removeItem("access_token");
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const getUserFromToken = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return {
      id: payload.user_id,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
};