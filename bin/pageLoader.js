#!/usr/bin/env node
import { Command } from 'commander';
import loader from '../index.js';

const program = new Command();

program
  .version('0.0.1')
  .description('Http page downloader')
  .arguments('<name>')
  .action((name) => console.log(loader(name)));
program.parse();
