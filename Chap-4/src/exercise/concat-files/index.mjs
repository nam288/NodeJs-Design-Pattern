import fs from 'fs';

function concat(...args) {
  const length = args.length;
  const [files, dest, cb] = [args.slice(0, length - 2), args[length - 2], args[length - 1]];

  const stream = fs.createWriteStream(dest, { flags: 'a' });
  function next(curr = 0) {
    if (curr === files.length) {
      return stream.end(() => cb(null));
    }
    fs.readFile(files[curr], null, (err, content) => {
      if (err) {
        return cb(err);
      }

      stream.write(content, (err) => {
        if (err) {
          return cb(err);
        }
        next(curr + 1);
      });
    });
  }
  next();
}

concat('a.txt', 'b.txt', 'c.txt', 'd.txt', 'dist.text', (err) => {
  if (err) {
    return console.error(err);
  }

  console.log('Concat successfully');
});
