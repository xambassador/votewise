export const getError = (error: any) => {
  const status = error.response.status || 500;
  const data = error.response.data || {
    message: "Something went wrong",
    error: {
      message: error.message,
    },
    data: null,
    success: false,
  };
  return { status, data };
};
