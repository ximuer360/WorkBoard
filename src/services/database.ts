import { Task } from '../types/task';
import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// 使用 require 导入 better-sqlite3
const Database = require('better-sqlite3');

const isDev = process.env.NODE_ENV === 'development';
const dbPath = isDev 
  ? join(process.cwd(), 'tasks.db')
  : join(app.getPath('userData'), 'tasks.db');

console.log('Database path:', dbPath);

// 确保数据库目录存在
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  console.log('Creating database directory:', dbDir);
  mkdirSync(dbDir, { recursive: true });
}

let db;

try {
  console.log('Initializing database at:', dbPath);
  db = new Database(dbPath, { 
    verbose: console.log,
    fileMustExist: false
  });
  
  // 初始化数据库表
  console.log('Creating tasks table if not exists');
  const createTable = `
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      createTime TEXT NOT NULL,
      updateTime TEXT NOT NULL
    )
  `;
  
  db.prepare(createTable).run();
  console.log('Database table initialized successfully');
} catch (err) {
  console.error('Database initialization error:', err);
  throw err;
}

export const taskDb = {
  getAllTasks() {
    try {
      const stmt = db.prepare('SELECT * FROM tasks');
      const tasks = stmt.all();
      console.log('Retrieved tasks:', tasks);
      return tasks;
    } catch (err) {
      console.error('Error getting all tasks:', err);
      throw err;
    }
  },

  addTask(task: Task) {
    try {
      console.log('Adding task to database:', task);
      
      if (!task.id || !task.title || !task.status) {
        throw new Error('Invalid task data');
      }
      
      const stmt = db.prepare(`
        INSERT INTO tasks (id, title, status, createTime, updateTime) 
        VALUES (@id, @title, @status, @createTime, @updateTime)
      `);
      
      const params = {
        id: task.id,
        title: task.title,
        status: task.status,
        createTime: task.createTime,
        updateTime: task.updateTime
      };
      
      console.log('Executing SQL with params:', params);
      
      try {
        const result = stmt.run(params);
        console.log('SQL execution result:', result);
        
        if (result.changes !== 1) {
          throw new Error('Failed to insert task');
        }
        
        return result;
      } catch (sqlError) {
        console.error('SQL execution error:', sqlError);
        throw new Error(`Database error: ${sqlError.message}`);
      }
    } catch (err) {
      console.error('Error in addTask:', err);
      throw err;
    }
  },

  updateTaskStatus(taskId: string, status: string, updateTime: string) {
    try {
      const stmt = db.prepare(
        'UPDATE tasks SET status = ?, updateTime = ? WHERE id = ?'
      );
      return stmt.run(status, updateTime, taskId);
    } catch (err) {
      console.error('Error updating task status:', err);
      throw err;
    }
  },

  deleteTask(taskId: string) {
    try {
      const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
      return stmt.run(taskId);
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  },

  updateTask(task: Task) {
    try {
      console.log('Updating task in database:', task);
      
      if (!task.id || !task.title || !task.status) {
        throw new Error('Invalid task data');
      }
      
      const stmt = db.prepare(`
        UPDATE tasks 
        SET title = @title, 
            status = @status, 
            updateTime = @updateTime 
        WHERE id = @id
      `);
      
      const params = {
        id: task.id,
        title: task.title,
        status: task.status,
        updateTime: task.updateTime
      };
      
      console.log('Executing SQL with params:', params);
      const result = stmt.run(params);
      console.log('Update result:', result);
      
      if (result.changes !== 1) {
        throw new Error('Failed to update task');
      }
      
      return result;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  }
}; 