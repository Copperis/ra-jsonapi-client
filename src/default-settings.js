export default {
  getTotal: metaData => metaData.pagination.totalRows,
  headers: {
    Accept: 'application/vnd.api+json; charset=utf-8',
    'Content-Type': 'application/vnd.api+json; charset=utf-8',
  },
  withCredentials: true,
};
