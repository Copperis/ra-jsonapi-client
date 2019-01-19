const serializeItem = ({ id, attributes, relationships }) => ({
  id,
  ...attributes,
  ...Object.entries(relationships)
    .filter(([, value]) => !!value.data)
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value.data,
    }), {}),
});


export default data => (
  Array.isArray(data)
    ? data.map(serializeItem)
    : serializeItem(data)
);
