export interface Task {
  id: string;
  title: string;
  content: string;
  status: 'todo' | 'doing' | 'done';
  createTime: string;
  updateTime: string;
} 