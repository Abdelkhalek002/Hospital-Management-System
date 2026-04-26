export const parseQuery = (query) => {
  let {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "id",
    order = "ASC",
    ...filters
  } = query;

  return {
    page: Number(page),
    limit: Number(limit),
    search,
    sortBy,
    order,
    filters, // dynamic filters (role, status, etc.)
  };
};
