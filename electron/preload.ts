import { contextBridge, ipcRenderer } from 'electron';
import { IpcResponse, ElectronAPI } from '../src/types/interfaces';

const invokeWithTimeout = async <T>(channel: string, ...args: any[]): Promise<T> => {
  try {
    const result = await Promise.race([
      ipcRenderer.invoke(channel, ...args),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('IPC request timeout')), 10000)
      )
    ]);
    return result as T;
  } catch (error) {
    console.error(`Error in ${channel}:`, error);
    throw error;
  }
};

const api: ElectronAPI = {
  getAllTasks: async () => {
    try {
      return await invokeWithTimeout('get-all-tasks');
    } catch (error) {
      console.error('getAllTasks error:', error);
      throw error;
    }
  },
  addTask: async (task) => {
    try {
      return await invokeWithTimeout('add-task', task);
    } catch (error) {
      console.error('addTask error:', error);
      throw error;
    }
  },
  updateTaskStatus: async (data) => {
    try {
      return await invokeWithTimeout('update-task-status', data);
    } catch (error) {
      console.error('updateTaskStatus error:', error);
      throw error;
    }
  },
  deleteTask: async (taskId) => {
    try {
      return await invokeWithTimeout('delete-task', taskId);
    } catch (error) {
      console.error('deleteTask error:', error);
      throw error;
    }
  },
  updateTask: async (task) => {
    try {
      return await invokeWithTimeout('update-task', task);
    } catch (error) {
      console.error('updateTask error:', error);
      throw error;
    }
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);

// 添加错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
}); 