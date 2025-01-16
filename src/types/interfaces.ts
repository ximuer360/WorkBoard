import { Task } from './task';

export interface DatabaseResult {
  changes: number;
  lastInsertRowid: number;
}

export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ElectronAPI {
  getAllTasks: () => Promise<Task[]>;
  addTask: (task: Task) => Promise<IpcResponse<DatabaseResult>>;
  updateTaskStatus: (data: { taskId: string; status: string; updateTime: string }) => Promise<IpcResponse<DatabaseResult>>;
  deleteTask: (taskId: string) => Promise<IpcResponse<DatabaseResult>>;
  updateTask: (task: Task) => Promise<IpcResponse<DatabaseResult>>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 