export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  createTime: string;
  updateTime: string;
} 