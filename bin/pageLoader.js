#!/usr/bin/env node
import program from 'commander';
import loader from '../index.js';

program
  .version('0.0.1')
  .description('Http page downloader')
  .arguments('<name>')
  .action((name) => console.log(loader(name)));
program.parse();
