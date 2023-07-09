export const errorHandler = (e) => {
  if (process.env["SHOW_ERRORS"] === "YES") console.log(e);
  return null;
};