import * as fs from 'fs';
import * as path from 'path';
import * as superagent from 'superagent';
import * as mkdirp from 'mkdirp';
import { getPageLinks, urlToFilename } from './utils';
import { TaskQueue } from './taskQueue';

function saveFile(filename: string, content: string, cb: (err: Error | null) => void) {
  mkdirp(path.dirname(filename))
    .then(() => {
      fs.writeFile(filename, content, cb);
    })
    .catch((err) => {
      cb(err);
    });
}

function download(
  url: string,
  filename: string,
  cb: (err: Error | null, content?: string) => void
) {
  superagent.get(url).end((err, res) => {
    if (err) {
      return cb(err);
    }
    saveFile(filename, res.text, (err) => {
      if (err) {
        return cb(err);
      }
      console.log(`Downloaded and saved: ${url}`);
      cb(null, res.text);
    });
  });
}

const spidering = new Set();
export function spider(url: string, nesting: number, queue: TaskQueue) {
  if (spidering.has(url)) {
    return;
  }
  spidering.add(url);
  console.log(`Push ${url}`);
  queue.pushTask((done) => {
    spiderTask(url, nesting, queue, done);
  });
}

export function spiderTask(
  url: string,
  nesting: number,
  queue: TaskQueue,
  cb: (err: Error | null) => void
) {
  const filename = path.join(__dirname, 'result', urlToFilename(url));
  fs.readFile(filename, 'utf8', (err, fileContent) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return cb(err);
      }

      return download(url, filename, (err, requestContent) => {
        if (err) {
          return cb(err);
        }

        spiderLinks(url, requestContent, nesting, queue);
        return cb(null);
      });
    }

    spiderLinks(url, fileContent, nesting, queue);
    return cb(null);
  });
}

function spiderLinks(
  url: string,
  body: string | undefined,
  nesting: number,
  queue: TaskQueue
): void {
  if (nesting === 0 || !body) {
    return;
  }

  const links = getPageLinks(url, body);
  if (links.length === 0) {
    return;
  }

  links.forEach((link) => spider(link, nesting - 1, queue));
}
