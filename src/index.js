import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';

import { makeName, makeFileName } from './utils.js';

const fsp = fs.promises;

const makeHtmlLocalLinks = (html, requestURL, dirName) => {
  const $ = cheerio.load(html);
  // console.log($.html('img'));
  // console.log($('img'));
  // console.log($.html());
  const links = [];
  const imgs = [...$('img')]
    .filter((element) => $(element).attr('src'))
    .map((element) => {
      const fileUrl = new URL($(element).attr('src'), requestURL);
      // console.log(requestURL);
      // console.log(fileUrl);
      // console.log(element);
      return { element, fileUrl };
    })
    .map(({ element, fileUrl }) => {
      const fileName = makeFileName(fileUrl);
      links.push({ fileName, fileUrl });
      $(element).attr('src', `${dirName}/${fileName}`);
      return { element, fileUrl };
    });

  // console.log(imgs);
  // console.log($.html());
  return { html: $.html(), links };
};

const dowloadResurses = (links, dirPath) => {
  links.map((link) => {
    const filePath = path.join(dirPath, link.fileName);
    // console.log(link.fileUrl.href);
    // console.log(link.fileUrl.toString());
    // console.log(filePath);
    const url = (link.fileUrl).toString();
    console.log(url);
    return fsp.access(dirPath)
      .then(() => (axios.get(url, { responseType: 'arraybuffer' })))
      .then((response) => {
        console.log(response);
        console.log(url);
        fsp.writeFile(filePath, response.data);
      })
      .catch((err) => err.message);
  });
};
const pageLoader = (url, outputPath = process.cwd()) => {
  const requestURL = new URL(url);
  // console.log(url);
  // console.log(outputPath);
  // console.log(process.cwd());
  // console.log(requestURL);
  const fullOutputPath = path.resolve(outputPath);
  const htmlFileName = makeName(requestURL, 'html');
  const htmlFilePath = path.join(fullOutputPath, htmlFileName);
  const filesDirName = makeName(requestURL, 'files');
  const filesDirPath = path.join(fullOutputPath, filesDirName);
  let resourseLinks;
  return fsp.access(fullOutputPath)
    .then(() => axios.get(url))
    .then((page) => {
      const { html, links } = makeHtmlLocalLinks(page.data, requestURL, filesDirName);
      // console.log(html);
      // console.log(htmlFilePath);
      // console.log(page.data);
      resourseLinks = links;
      // console.log(resourseLinks);
      return fsp.writeFile(htmlFilePath, html);
    })
    .then(() => (
      // console.log(filesDirPath);
      fsp.mkdir(filesDirPath)
    ))
    .then(() => {
      // return dowloadResurses(resourseLinks, filesDirPath);
      const promises = resourseLinks.map((link) => {
        const filePath = path.join(filesDirPath, link.fileName);
        // console.log(link.fileUrl.href);
        // console.log(link.fileUrl.toString());
        // console.log(filePath);
        const filelink = (link.fileUrl).toString();
        // console.log(filelink);
        // console.log(filesDirPath);
        // console.log(filePath);
        const promise = fsp.access(filesDirPath)
          .then(() => axios.get(filelink, { responseType: 'arraybuffer' }))
          .then((response) => {
            // console.log(response.data);
            // console.log(filelink);
            fsp.writeFile(filePath, response.data);
          })
          .catch((err) => err.message);
        return promise;
      });
      const promise = Promise.all(promises);
      return promise.then();
    })
    .then(() => ({ fullOutputPath }));
};

export default pageLoader;
