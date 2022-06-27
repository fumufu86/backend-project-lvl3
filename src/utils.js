const formatName = (name) => name.split(/[^a-zA-Z0-9]/)
  .filter((i) => i).join('-');

const makeName = (url) => {
  const formatedName = formatName(`${url.host}${url.pathname}`);
  console.log(formatedName);
  return `${formatedName}.html`;
};

export default makeName;
