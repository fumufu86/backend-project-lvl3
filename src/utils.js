import path from 'path';

const formatName = (name) => name.split(/[^a-zA-Z0-9]/)
  .filter((i) => i).join('-');

const nameTypeMap = {
  html: '.html',
  files: '_files',
};

export const makeName = (url, type) => {
  const formatedName = formatName(`${url.host}${url.pathname}`);
  // console.log(formatedName);
  return `${formatedName}${nameTypeMap[type]}`;
};

export const makeFileName = (url) => {
  const { dir, name, ext } = path.parse(url.pathname);
  // console.log(url);
  // console.log(url.pathname);
  // console.log(path.parse(url.pathname));
  // console.log(`${dir}, ${name}, ${ext}`);
  const formattedName = formatName(`${url.hostname}/${dir}/${name}`);
  return ext ? `${formattedName}${ext}` : `${formattedName}.html`;
};
