export const sendResponse = (res, status, data, error = null) => {
  res.status(status).json({
    success: status < 400,
    data,
    message: error ?? null
  });

  };