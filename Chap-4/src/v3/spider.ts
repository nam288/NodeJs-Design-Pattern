import * as fs from 'fs';
import * as path from 'path';
import * as superagent from 'superagent';
import * as mkdirp from 'mkdirp';
import { getPageLinks, urlToFilename } from './utils';

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

const cache = new Set<string>();

export function spider(url: string, nesting: number, cb: (err: Error | null) => void) {
  if (cache.has(url)) {
    return process.nextTick(cb);
  }
  cache.add(url);

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

        spiderLinks(url, requestContent, nesting, cb);
      });
    }

    spiderLinks(url, fileContent, nesting, cb);
  });
}

function spiderLinks(
  url: string,
  body: string | undefined,
  nesting: number,
  cb: (err: Error | null) => void
): void {
  if (nesting === 0 || !body) {
    return process.nextTick(() => cb(null));
  }

  const links = getPageLinks(url, body);
  if (links.length === 0) {
    return process.nextTick(cb);
  }

  function iterate(index: number) {
    if (index === links.length) {
      return cb(null);
    }
    console.log(`Downloading links ${links[index]} (${index + 1}/${links.length})`);

    spider(links[index], nesting - 1, (err) => {
      if (err) {
        return cb(err);
      }
      iterate(index + 1);
    });
  }

  iterate(0);
}
