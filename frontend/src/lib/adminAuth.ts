const KEY = "qcm-admin-auth";

export const isAdminAuthed = () => {
  return localStorage.getItem(KEY) === "true";
};

export const setAdminAuthed = (value: boolean) => {
  localStorage.setItem(KEY, value ? "true" : "false");
};
