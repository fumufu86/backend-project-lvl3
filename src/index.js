import fs from 'fs';
import path from 'path';
import axios from 'axios';
import 'axios-debug-log';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';

import { makeName, makeFileName } from './utils.js';

const log = debug('page-loader');

const fsp = fs.promises;
const tagMap = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const makeHtmlLocalLinks = (html, requestURL, dirName) => {
  const $ = cheerio.load(html);
  // console.log($.html('img'));
  // console.log($('img'));
  // console.log($.html());
  const links = [];
  Object.entries(tagMap)
    .forEach(([tagName, attrName]) => {
      [...$(tagName)]
        .filter((element) => $(element).attr(attrName))
        .map((element) => {
          const fileUrl = new URL($(element).attr(attrName), requestURL);
          // console.log(requestURL);
          // console.log(fileUrl);
          // console.log(element);
          // console.log(fileUrl.origin);
          // console.log(requestURL.origin);
          return { element, fileUrl };
        })
        // .filter(({ fileUrl }) => fileUrl.origin === requestURL.origin)
        .filter(({ fileUrl }) => fileUrl.host === requestURL.host)
        .map(({ element, fileUrl }) => {
          const fileName = makeFileName(fileUrl);
          links.push({ fileName, fileUrl });
          $(element).attr(attrName, `${dirName}/${fileName}`);
          return { element, fileUrl };
        });
    });

  // console.log(imgs);
  // console.log($.html());
  return { html: $.html(), links };
};

const dowloadResurses = (links, dirPath) => {
  const promises = links.map((link) => {
    const filePath = path.join(dirPath, link.fileName);
    // console.log(link.fileUrl.href);
    // console.log(link.fileUrl.toString());
    // console.log(filePath);
    const url = (link.fileUrl).toString();
    // console.log(url);
    return {
      title: `Downloading - ${url}`,
      task: (ctx, task) => (axios.get(url, { responseType: 'arraybuffer' }))
        .then((response) => {
          // console.log(response);
          // console.log(url);
          fsp.writeFile(filePath, response.data);
        })
        .catch((err) => task.skip(err.message)),
    };
  });
  return new Listr(promises, { concurrent: true });
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
    .then(() => {
      log('request - ', url);
      return axios.get(url);
    })
    .then((page) => {
      log('response code - ', page.status);
      const { html, links } = makeHtmlLocalLinks(page.data, requestURL, filesDirName);
      log('write html into - ', htmlFilePath);
      // console.log(html);
      // console.log(htmlFilePath);
      // console.log(page.data);
      resourseLinks = links;
      // console.log(resourseLinks);
      return fsp.writeFile(htmlFilePath, html);
    })
    .then(() => {
      // console.log(filesDirPath);
      log('create directory for files - ', filesDirPath);
      return fsp.mkdir(filesDirPath);
    })
    .then(() => {
      // return dowloadResurses(resourseLinks, filesDirPath);
      // const promises = resourseLinks.map((link) => {
      //   const filePath = path.join(filesDirPath, link.fileName);
      // console.log(link.fileUrl.href);
      // console.log(link.fileUrl.toString());
      // console.log(filePath);
      //   const filelink = (link.fileUrl).toString();
      // console.log(filelink);
      // console.log(filesDirPath);
      // console.log(filePath);
      //   const promise = fsp.access(filesDirPath)
      //     .then(() => axios.get(filelink, { responseType: 'arraybuffer' }))
      //     .then((response) => {
      // console.log(response.data);
      // console.log(filelink);
      //       fsp.writeFile(filePath, response.data);
      //     })
      //     .catch((err) => err.message);
      //   return promise;
      // });
      // const promises = dowloadResurses(resourseLinks, filesDirPath);
      // const promise = Promise.all(promises);
      const tasks = dowloadResurses(resourseLinks, filesDirPath);
      log('downloading files into - ', filesDirPath);
      // return promise.then();
      return tasks.run();
    })
    .then(() => ({ fullOutputPath }));
};

export default pageLoader;
