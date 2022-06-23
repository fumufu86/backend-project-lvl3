#!/usr/bin/env node
import { Command } from 'commander';
import pageLoader from '../index.js';

const program = new Command();

program
  .version('0.0.1')
  .description('Http page downloader')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url) => pageLoader(url, program.opts().output)
    .then(({ fullOutputPath }) => console.log(`Page was successfully downloaded into '${fullOutputPath}'`))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    }))
  .parse(process.argv);
