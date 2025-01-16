"use strict";
const electron = require("electron");
const path = require("path");
const url = require("url");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
const __dirname$1 = url.fileURLToPath(new URL(".", typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href));
let taskDb;
async function initDatabase() {
  try {
    const { taskDb: db } = await Promise.resolve().then(() => require("./database-DeitMNJt.js"));
    taskDb = db;
    console.log("Database initialized successfully in main process");
  } catch (err) {
    console.error("Failed to initialize database:", err);
    electron.dialog.showErrorBox("数据库初始化失败", err.message);
  }
}
electron.ipcMain.handle("get-all-tasks", async () => {
  try {
    if (!taskDb) {
      throw new Error("Database not initialized");
    }
    console.log("Getting all tasks");
    const tasks = await taskDb.getAllTasks();
    console.log("Tasks retrieved:", tasks);
    return tasks;
  } catch (err) {
    console.error("Error in get-all-tasks:", err);
    electron.dialog.showErrorBox("获取任务失败", err.message);
    return [];
  }
});
electron.ipcMain.handle("add-task", async (event, task) => {
  try {
    if (!taskDb) {
      throw new Error("Database not initialized");
    }
    if (!task || !task.id || !task.title || !task.status) {
      throw new Error("Invalid task data");
    }
    console.log("Adding task in main process:", task);
    const result = await taskDb.addTask(task);
    console.log("Task added in main process, result:", result);
    if (mainWindow) {
      mainWindow.webContents.send("task-added", { success: true, data: result });
    }
    return { success: true, data: result };
  } catch (err) {
    console.error("Error in add-task:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    electron.dialog.showErrorBox("添加任务失败", errorMessage);
    return { success: false, error: errorMessage };
  }
});
electron.ipcMain.handle("update-task-status", async (_, { taskId, status, updateTime }) => {
  try {
    return await taskDb.updateTaskStatus(taskId, status, updateTime);
  } catch (err) {
    console.error("Error in update-task-status:", err);
    throw err;
  }
});
electron.ipcMain.handle("delete-task", async (_, taskId) => {
  try {
    return await taskDb.deleteTask(taskId);
  } catch (err) {
    console.error("Error in delete-task:", err);
    throw err;
  }
});
electron.ipcMain.handle("update-task", async (_, task) => {
  try {
    if (!taskDb) {
      throw new Error("Database not initialized");
    }
    if (!task || !task.id || !task.title || !task.status) {
      throw new Error("Invalid task data");
    }
    console.log("Updating task in main process:", task);
    const result = await taskDb.updateTask(task);
    console.log("Task updated in main process, result:", result);
    return { success: true, data: result };
  } catch (err) {
    console.error("Error in update-task:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    electron.dialog.showErrorBox("更新任务失败", errorMessage);
    return { success: false, error: errorMessage };
  }
});
let mainWindow = null;
async function createWindow() {
  try {
    await initDatabase();
    mainWindow = new electron.BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname$1, "preload.js")
      },
      icon: path.join(__dirname$1, "../Resources/icon.png")
    });
    if (process.env.VITE_DEV_SERVER_URL) {
      await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(path.join(__dirname$1, "../dist/index.html"));
    }
    mainWindow.on("closed", () => {
      mainWindow = null;
    });
    const template = [
      {
        label: "开发",
        submenu: [
          {
            label: "开发者工具",
            accelerator: process.platform === "darwin" ? "Cmd+Option+I" : "Ctrl+Shift+I",
            click: () => {
              mainWindow == null ? void 0 : mainWindow.webContents.toggleDevTools();
            }
          }
        ]
      }
    ];
    if (process.env.VITE_DEV_SERVER_URL) {
      const menu = electron.Menu.buildFromTemplate(template);
      electron.Menu.setApplicationMenu(menu);
    } else {
      electron.Menu.setApplicationMenu(null);
    }
  } catch (error) {
    console.error("Error creating window:", error);
    electron.dialog.showErrorBox("启动错误", error.message);
  }
}
electron.app.whenReady().then(createWindow).catch((err) => {
  console.error("Failed to start app:", err);
  electron.dialog.showErrorBox("启动失败", err.message);
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  electron.dialog.showErrorBox("未处理的错误", error.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  electron.dialog.showErrorBox("未处理的 Promise 错误", reason.toString());
});
//# sourceMappingURL=main.js.map
