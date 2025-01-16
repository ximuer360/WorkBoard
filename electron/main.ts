import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 在主进程中导入数据库服务
let taskDb: any;

async function initDatabase() {
  try {
    const { taskDb: db } = await import('../src/services/database');
    taskDb = db;
    console.log('Database initialized successfully in main process');
  } catch (err) {
    console.error('Failed to initialize database:', err);
    dialog.showErrorBox('数据库初始化失败', err.message);
  }
}

// IPC 处理器
ipcMain.handle('get-all-tasks', async () => {
  try {
    if (!taskDb) {
      throw new Error('Database not initialized');
    }
    console.log('Getting all tasks');
    const tasks = await taskDb.getAllTasks();
    console.log('Tasks retrieved:', tasks);
    return tasks;
  } catch (err) {
    console.error('Error in get-all-tasks:', err);
    dialog.showErrorBox('获取任务失败', err.message);
    return [];
  }
});

ipcMain.handle('add-task', async (event, task) => {
  try {
    if (!taskDb) {
      throw new Error('Database not initialized');
    }
    
    // 验证任务数据
    if (!task || !task.id || !task.title || !task.status) {
      throw new Error('Invalid task data');
    }
    
    console.log('Adding task in main process:', task);
    const result = await taskDb.addTask(task);
    console.log('Task added in main process, result:', result);
    
    // 通知渲染进程任务已添加
    if (mainWindow) {
      mainWindow.webContents.send('task-added', { success: true, data: result });
    }
    
    return { success: true, data: result };
  } catch (err) {
    console.error('Error in add-task:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    dialog.showErrorBox('添加任务失败', errorMessage);
    return { success: false, error: errorMessage };
  }
});

ipcMain.handle('update-task-status', async (_, { taskId, status, updateTime }) => {
  try {
    return await taskDb.updateTaskStatus(taskId, status, updateTime);
  } catch (err) {
    console.error('Error in update-task-status:', err);
    throw err;
  }
});

ipcMain.handle('delete-task', async (_, taskId) => {
  try {
    return await taskDb.deleteTask(taskId);
  } catch (err) {
    console.error('Error in delete-task:', err);
    throw err;
  }
});

ipcMain.handle('update-task', async (_, task) => {
  try {
    if (!taskDb) {
      throw new Error('Database not initialized');
    }
    
    // 验证任务数据
    if (!task || !task.id || !task.title || !task.status) {
      throw new Error('Invalid task data');
    }
    
    console.log('Updating task in main process:', task);
    const result = await taskDb.updateTask(task);
    console.log('Task updated in main process, result:', result);
    
    return { success: true, data: result };
  } catch (err) {
    console.error('Error in update-task:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    dialog.showErrorBox('更新任务失败', errorMessage);
    return { success: false, error: errorMessage };
  }
});

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  try {
    await initDatabase();

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js')
      },
      icon: join(__dirname, '../Resources/icon.png')
    });

    if (process.env.VITE_DEV_SERVER_URL) {
      await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    // 创建菜单
    const template = [
      {
        label: '开发',
        submenu: [
          {
            label: '开发者工具',
            accelerator: process.platform === 'darwin' ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
            click: () => {
              mainWindow?.webContents.toggleDevTools();
            }
          }
        ]
      }
    ];

    // 仅在开发环境显示开发菜单
    if (process.env.VITE_DEV_SERVER_URL) {
      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    } else {
      // 生产环境可以隐藏菜单
      Menu.setApplicationMenu(null);
    }
  } catch (error) {
    console.error('Error creating window:', error);
    dialog.showErrorBox('启动错误', error.message);
  }
}

app.whenReady().then(createWindow).catch(err => {
  console.error('Failed to start app:', err);
  dialog.showErrorBox('启动失败', err.message);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// 添加错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('未处理的错误', error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  dialog.showErrorBox('未处理的 Promise 错误', reason.toString());
}); 