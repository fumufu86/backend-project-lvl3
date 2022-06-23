import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';

const fsp = fs.promises;

const pageLoader = (url, outputPath = process.cwd()) => {
  const requestURL = new URL(url);
  const fullOutputPath = path.resolve(outputPath);
  return fullOutputPath;
};

export default pageLoader;
