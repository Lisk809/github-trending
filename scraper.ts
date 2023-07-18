import * as fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { execSync } from 'node:child_process';

function gitAddCommitPush(date: string, filename: string): void {
  const cmdGitAdd = `git add ${filename}`;
  const cmdGitCommit = `git commit -m "${date}"`;
  const cmdGitPush = 'git push -u origin master';

  // Execute git commands using child_process or a Git library in TypeScript
  execSync(cmdGitAdd);
  execSync(cmdGitCommit);
  execSync(cmdGitPush);
}

function createMarkdown(date: string, filename: string): void {
  fs.writeFileSync(filename, `## ${date}\n`);
}

async function scrape(language: string, filename: string): Promise<void> {
  const url = `https://github.com/trending/${language}`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const items = $('div.Box article.Box-row');

  fs.appendFileSync(filename, `\n#### ${language}\n`);

  items.each((index, element) => {
    const title = $(element).find('.lh-condensed a').text();
    const owner = $(element).find('.lh-condensed span.text-normal').text();
    const description = $(element).find('p.col-9').text();
    const url = 'https://github.com' + $(element).find('.lh-condensed a').attr('href');

    fs.appendFileSync(filename, `* [${title}](${url}): ${description}\n`.replace(/\n/g, '').replace(/ /g, '')+"\n");
  });
}

function job(): void {
  const strdate = new Date().toISOString().split('T')[0];
  const filename = `${strdate}.md`;

  // create markdown file
  createMarkdown(strdate, filename);

  // write markdown
  scrape('python', filename);
  scrape('swift', filename);
  scrape('javascript', filename);
  scrape('go', filename);

  // git add commit push
  // gitAddCommitPush(strdate, filename);
}

job();