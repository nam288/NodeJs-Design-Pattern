import * as fs from 'fs';
import * as path from 'path';

function explore(dir: string, cb: (err: Error | null) => void) {
  fs.readdir(dir, (err, stats) => {
    if (err) {
      return cb(err);
    }

    next();

    function next(curr = 0) {
      if (curr === stats.length) {
        return cb(null);
      }

      const nextPath = path.join(dir, stats[curr]);

      fs.stat(nextPath, (err, currentStat) => {
        if (err) {
          return cb(err);
        }
        if (currentStat.isFile()) {
          console.log(`Found file in path: ${path.resolve(nextPath)}`);
        } else {
          console.log(`Found directory in path: ${path.resolve(nextPath)}`);
          explore(nextPath, cb);
        }
        next(curr + 1);
      });
    }
  });
}

explore('../..', (err) => {
  if (err) {
    return console.error(err);
  }
});
