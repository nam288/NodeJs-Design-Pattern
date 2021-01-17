import * as fs from 'fs';
import * as path from 'path';
import * as superagent from 'superagent';
import * as mkdirp from 'mkdirp';
import { urlToFilename } from './utils';

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

export function spider(
  url: string,
  cb: (err: Error | null, filename?: string, downloaded?: boolean) => void
) {
  const filename = path.join(__dirname, 'result', urlToFilename(url));
  fs.access(filename, (err) => {
    if (!err || err.code !== 'ENOENT') {
      return cb(null, filename, false);
    }
    download(url, filename, (err) => {
      if (err) {
        return cb(err);
      }

      cb(null, filename, true);
    });
  });
}
