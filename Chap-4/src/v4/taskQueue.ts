import { EventEmitter } from 'events';

type Task = (cb: (err: Error | null) => void) => void;

export class TaskQueue extends EventEmitter {
  private readonly concurrency: number;
  private running: number;
  private queue: Task[];
  constructor(concurrency: number) {
    super();
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  pushTask(task: Task): TaskQueue {
    this.queue.push(task);
    process.nextTick(this.next.bind(this));
    return this;
  }

  next() {
    if (this.running === 0 && this.queue.length === 0) {
      return this.emit('empty');
    }

    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        task((err) => {
          if (err) {
            return this.emit('error', err);
          }
          console.log({ remain: this.queue.length });
          this.running--;
          process.nextTick(this.next.bind(this));
        });
        this.running++;
      }
    }
  }
}
