import type { TaskInput, TaskKey } from "@/types/task";
import type { TaskService } from "./task";

export class TaskAdder {
  private taskService: TaskService | null = null;

  setTaskService(taskService: TaskService) {
    this.taskService = taskService;
  }

  async add<K extends TaskKey>(key: K, input: TaskInput<K>) {
    if (!this.taskService) {
      throw new Error("taskService is null.");
    }

    const runner = await this.taskService.runner;
    await runner.addJob(key, input as any);
  }
}
