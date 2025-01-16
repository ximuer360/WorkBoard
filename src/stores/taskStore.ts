import { defineStore } from 'pinia';
import { Task } from '../types/task';
import { IpcResponse, DatabaseResult } from '../types/interfaces';

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
    async loadTasks() {
      try {
        this.loading = true;
        this.error = null;
        const tasks = await window.electronAPI.getAllTasks();
        this.tasks = tasks;
      } catch (err) {
        console.error('Failed to load tasks:', err);
        this.error = err instanceof Error ? err.message : 'Failed to load tasks';
      } finally {
        this.loading = false;
      }
    },

    async addTask(title: string) {
      try {
        this.loading = true;
        this.error = null;
        
        const newTask: Task = {
          id: Date.now().toString(),
          title: title.trim(),
          status: 'todo',
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
        };
        
        console.log('Creating new task:', newTask);
        
        const response = await window.electronAPI.addTask(newTask);
        console.log('Database response:', response);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to add task');
        }
        
        this.tasks.push(newTask);
        return newTask;
      } catch (err) {
        console.error('Failed to add task:', err);
        this.error = err instanceof Error ? err.message : 'Failed to add task';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async updateTaskStatus(taskId: string, status: Task['status']) {
      try {
        const updateTime = new Date().toISOString();
        await window.electronAPI.updateTaskStatus({ taskId, status, updateTime });
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
          task.status = status;
          task.updateTime = updateTime;
        }
      } catch (err) {
        console.error('Failed to update task status:', err);
        this.error = 'Failed to update task status';
      }
    },
    
    async deleteTask(taskId: string) {
      try {
        await window.electronAPI.deleteTask(taskId);
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index > -1) {
          this.tasks.splice(index, 1);
        }
      } catch (err) {
        console.error('Failed to delete task:', err);
        this.error = 'Failed to delete task';
      }
    },

    async updateTask(updatedTask: Task) {
      try {
        this.loading = true;
        this.error = null;
        
        console.log('Updating task in store:', updatedTask);
        const response = await window.electronAPI.updateTask(updatedTask);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to update task');
        }
        
        const taskIndex = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (taskIndex > -1) {
          this.tasks[taskIndex] = { ...updatedTask };
          console.log('Task updated in store');
        }
      } catch (err) {
        console.error('Failed to update task:', err);
        this.error = err instanceof Error ? err.message : 'Failed to update task';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  },
  
  getters: {
    todoTasks: (state) => state.tasks.filter(task => task.status === 'todo'),
    doingTasks: (state) => state.tasks.filter(task => task.status === 'doing'),
    doneTasks: (state) => state.tasks.filter(task => task.status === 'done'),
  }
}); 