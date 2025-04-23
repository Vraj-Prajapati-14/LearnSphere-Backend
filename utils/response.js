export const sendResponse = (res, status, data, error = null) => {
    res.status(status).json({ success: error === null, data, error });
  };