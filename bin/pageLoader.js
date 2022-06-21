#!/usr/bin/env node
import { Command } from 'commander';
import loader from '../index.js';

const program = new Command();

program
  .version('0.0.1')
  .description('Http page downloader')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url) => console.log(loader(url, program.output)))
  .parse(process.argv);
