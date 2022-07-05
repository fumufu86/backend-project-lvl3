import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import path from 'path';
import fs from 'fs';
import os from 'os';

import pageLoader from '../src/index.js';

const fsp = fs.promises;
nock.disableNetConnect();
axios.defaults.adapter = httpAdapter;

const readFile = (dirName, fileName, encoding = null) => (
  fsp.readFile(path.resolve(dirName, fileName), encoding)
);

let pathTmp;

beforeEach(async () => {
  pathTmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'pageLoader-'));
});

test('test1', async () => {
  // const fullPathExpected = path.resolve('__fixtures__/expected.html');
  // const dataExpectedHtml = await fsp.readFile(fullPathExpected, 'utf-8');
  const htmlExpected = await readFile('__fixtures__', 'expected.html', 'utf8');
  const html = await readFile('__fixtures__', 'page.html', 'utf8');
  const image = await readFile('__fixtures__', 'files/image.png');
  // console.log(image);
  nock('http://ru.hexlet.io')
    .get('/courses')
    .reply(200, html)
    .get('/assets/professions/nodejs.png')
    .reply(200, image);

  await pageLoader('http://ru.hexlet.io/courses', pathTmp);

  // const fullpathTmp = path.resolve(pathTmp, 'test-ru-page.html');
  // console.log('123');
  // console.log(pathTmp);
  const htmlDownloaded = await readFile(pathTmp, 'ru-hexlet-io-courses.html', 'utf-8');
  const imageDownloaded = await readFile(pathTmp, 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png');
  // console.log('111');
  // console.log(htmlDownloaded);
  expect(htmlDownloaded).toEqual(htmlExpected);
  expect(imageDownloaded).toEqual(image);
});

test('Error request fail', async () => {
  nock('http://ru.hexlet.io')
    .get('/not-exist-page')
    .reply(404, '');

  await expect(pageLoader('http://ru.hexlet.io/not-exist-page', pathTmp)).rejects.toThrow('status code 404');
});

test('Error nonExistOutputPath', async () => {
  nock('http://ru.hexlet.io')
    .get('/courses')
    .reply(200, 'data');

  await expect(pageLoader('http://ru.hexlet.io/courses', 'notExixstPath')).rejects.toThrow('no such file or directory');
});
