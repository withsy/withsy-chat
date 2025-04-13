import type { CronTask, TaskInput, TaskKey, TaskMap } from "@/types/task";
import { run, type Runner, type TaskList } from "graphile-worker";
import type { ServiceMap } from "./global";

export class TaskService {
  private constructor(private readonly runner: Runner) {}

  static async create(s: ServiceMap, taskMap: TaskMap, cronTasks: CronTask[]) {
    const runner = await run({
      pgPool: s.pool,
      taskList: taskMap as TaskList,
      crontab: cronTasks.map(({ cron, key }) => `${cron} ${key}`).join("\n"),
    });
    return new TaskService(runner);
  }

  async add<K extends TaskKey>(key: K, input: TaskInput<K>) {
    return await this.runner.addJob(key, input as any);
  }
}
