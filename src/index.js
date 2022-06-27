import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';

import makeName from './utils.js';

const fsp = fs.promises;

const pageLoader = (url, outputPath = process.cwd()) => {
  const requestURL = new URL(url);
  // console.log(url);
  // console.log(outputPath);
  // console.log(path.resolve(outputPath));
  // console.log(process.cwd());
  const fullOutputPath = path.resolve(outputPath);
  const htmlFileName = makeName(requestURL);
  const htmlFilePath = path.join(fullOutputPath, htmlFileName);

  return fsp.access(fullOutputPath)
    .then(() => axios.get(url))
    .then((page) => page.data)
    .then((htmlFile) => {
      // console.log(cheerio.load(htmlFile).html());
      const $ = cheerio.load(htmlFile);
      return fsp.writeFile(htmlFilePath, $.html());
    })
    .then(() => ({ fullOutputPath }));
};

export default pageLoader;
