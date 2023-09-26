export class AsyncQueue {
  private readonly tasks: (() => Promise<unknown>)[] = [];
  private isRunning = false;
  constructor() {}

  async run() {
    if (this.isRunning) return;
    this.isRunning = true;

    while (this.tasks.length > 0) {
      const task = this.tasks.shift();
      await task?.();
    }

    this.isRunning = false;
  }

  public enqueue(task: () => Promise<unknown>) {
    this.tasks.push(task);
    this.run();
  }
}
