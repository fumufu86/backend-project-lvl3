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

let pathTmp;

beforeEach(async () => {
  pathTmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'pageLoader-'));
});

test('test1', async () => {
  const fullPathExpected = path.resolve('__fixtures__/expected.html');
  const dataExpectedHtml = await fsp.readFile(fullPathExpected, 'utf-8');

  nock('http://test.ru').get('/page').reply(200, dataExpectedHtml);

  await pageLoader('http://test.ru/page', pathTmp);

  const fullpathTmp = path.resolve(pathTmp, 'test-ru-page.html');
  const downloaded = await fsp.readFile(fullpathTmp, 'utf8');

  expect(downloaded).toEqual(dataExpectedHtml);
});
