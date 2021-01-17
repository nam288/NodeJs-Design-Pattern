import { spider } from './spider';
import { TaskQueue } from './taskQueue';

const url = process.argv[2];
const nesting = Number.parseInt(process.argv[3], 10) || 1;
const threshold = Number.parseInt(process.argv[4], 10) || 2;
const queue = new TaskQueue(threshold);
queue.on('empty', () => {
  console.log('Download completed');
});

queue.on('error', console.error);
spider(url, nesting, queue);
