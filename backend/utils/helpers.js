// Utility: Send a standardized API response
const sendResponse = (res, statusCode, success, message, data = null) => {
  const payload = { success, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

// Utility: Create a custom error with a status code
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = { sendResponse, createError };
