"use strict";
const electron = require("electron");
const invokeWithTimeout = async (channel, ...args) => {
  try {
    const result = await Promise.race([
      electron.ipcRenderer.invoke(channel, ...args),
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error("IPC request timeout")), 1e4)
      )
    ]);
    return result;
  } catch (error) {
    console.error(`Error in ${channel}:`, error);
    throw error;
  }
};
const api = {
  getAllTasks: async () => {
    try {
      return await invokeWithTimeout("get-all-tasks");
    } catch (error) {
      console.error("getAllTasks error:", error);
      throw error;
    }
  },
  addTask: async (task) => {
    try {
      return await invokeWithTimeout("add-task", task);
    } catch (error) {
      console.error("addTask error:", error);
      throw error;
    }
  },
  updateTaskStatus: async (data) => {
    try {
      return await invokeWithTimeout("update-task-status", data);
    } catch (error) {
      console.error("updateTaskStatus error:", error);
      throw error;
    }
  },
  deleteTask: async (taskId) => {
    try {
      return await invokeWithTimeout("delete-task", taskId);
    } catch (error) {
      console.error("deleteTask error:", error);
      throw error;
    }
  },
  updateTask: async (task) => {
    try {
      return await invokeWithTimeout("update-task", task);
    } catch (error) {
      console.error("updateTask error:", error);
      throw error;
    }
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", api);
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});
