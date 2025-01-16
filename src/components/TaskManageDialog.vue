<template>
  <div v-if="show" class="manage-dialog-overlay">
    <div class="manage-dialog-content">
      <div class="dialog-header">
        <h3>任务管理</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      
      <div class="dialog-body">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchText" 
            placeholder="搜索任务..."
            @input="handleSearch"
          />
        </div>
        
        <div class="task-list">
          <table>
            <thead>
              <tr>
                <th>任务名称</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in filteredTasks" :key="task.id">
                <td class="title-cell">
                  <template v-if="editingTask?.id === task.id">
                    <textarea
                      v-model="editingTask.title"
                      @blur="handleSave(task)"
                      @keydown.enter.prevent="handleKeyDown($event, task)"
                      ref="editInput"
                      rows="2"
                      class="edit-textarea"
                    ></textarea>
                  </template>
                  <template v-else>
                    <div class="task-title">{{ task.title }}</div>
                  </template>
                </td>
                <td>
                  <select 
                    v-model="task.status"
                    @change="handleStatusChange(task)"
                    :class="'status-' + task.status"
                  >
                    <option value="todo">待办事宜</option>
                    <option value="doing">正在处理</option>
                    <option value="done">办理完毕</option>
                  </select>
                </td>
                <td>{{ formatTime(task.createTime) }}</td>
                <td>{{ formatTime(task.updateTime) }}</td>
                <td>
                  <button class="edit-btn" @click="handleEdit(task)">
                    编辑
                  </button>
                  <button class="delete-btn" @click="handleDelete(task)">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Task } from '../types/task';
import { useTaskStore } from '../stores/taskStore';

const props = defineProps<{
  show: boolean;
  tasks: Task[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const taskStore = useTaskStore();
const searchText = ref('');
const editingTask = ref<Task | null>(null);
const editInput = ref<HTMLInputElement | null>(null);

// 格式化时间
const formatTime = (time: string) => {
  return new Date(time).toLocaleString();
};

// 过滤任务
const filteredTasks = computed(() => {
  return props.tasks.filter(task => 
    task.title.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 处理搜索
const handleSearch = () => {
  // 可以添加防抖如果需要
};

// 处理编辑
const handleEdit = (task: Task) => {
  editingTask.value = { ...task };
  // 等待 DOM 更新后聚焦输入框
  setTimeout(() => {
    editInput.value?.focus();
  });
};

// 添加键盘事件处理
const handleKeyDown = (event: KeyboardEvent, task: Task) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // 阻止默认的回车换行
    handleSave(task);
  }
};

// 修改保存处理函数
const handleSave = async (task: Task) => {
  if (!editingTask.value) return;
  
  const newTitle = editingTask.value.title.trim();
  if (!newTitle) {
    window.alert('任务标题不能为空');
    return;
  }

  if (newTitle !== task.title) {
    try {
      const updatedTask = {
        ...task,
        title: newTitle,
        updateTime: new Date().toISOString()
      };
      
      console.log('Saving updated task:', updatedTask);
      await taskStore.updateTask(updatedTask);
      console.log('Task updated successfully');
      
      // 更新本地任务数据
      Object.assign(task, updatedTask);
    } catch (error) {
      console.error('Failed to update task:', error);
      window.alert(error instanceof Error ? error.message : '更新任务失败，请重试');
      return;
    }
  }
  
  editingTask.value = null;
};

// 处理状态变更
const handleStatusChange = async (task: Task) => {
  try {
    await taskStore.updateTaskStatus(task.id, task.status);
  } catch (error) {
    console.error('Failed to update task status:', error);
  }
};

// 处理删除
const handleDelete = async (task: Task) => {
  if (confirm('确定要删除这个任务吗？')) {
    try {
      await taskStore.deleteTask(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }
};

// 处理关闭
const handleClose = () => {
  emit('close');
};

// 监听显示状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    searchText.value = '';
    editingTask.value = null;
  }
});
</script>

<style scoped>
.manage-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.manage-dialog-content {
  background: white;
  border-radius: 8px;
  min-width: 800px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  color: #1f1f1f;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #666;
}

.dialog-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.search-bar {
  margin-bottom: 16px;
}

.search-bar input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;
}

.search-bar input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.task-list {
  overflow-x: auto;
  max-height: calc(90vh - 200px);
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th {
  background: #fafafa;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fafafa;
}

th, td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
}

td {
  background: white;
}

tr:hover td {
  background: #f5f5f5;
}

td select {
  width: 100%;
  max-width: 120px;
}

td select:hover {
  border-color: #40a9ff;
}

.edit-btn, .delete-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.3s;
}

.edit-btn {
  background: #1890ff;
  color: white;
}

.delete-btn {
  background: #ff4d4f;
  color: white;
}

.edit-btn:hover {
  background: #40a9ff;
}

.delete-btn:hover {
  background: #ff7875;
}

td input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  outline: none;
}

td select option[value="todo"] {
  color: #1890ff;
}

td select option[value="doing"] {
  color: #faad14;
}

td select option[value="done"] {
  color: #52c41a;
}

/* 添加状态颜色样式 */
.status-todo {
  border-left: 3px solid #1890ff !important;
}

.status-doing {
  border-left: 3px solid #faad14 !important;
}

.status-done {
  border-left: 3px solid #52c41a !important;
}

/* 修改表格单元格样式 */
.title-cell {
  max-width: 300px;
  min-width: 200px;
}

.task-title {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  max-height: 4.5em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.edit-textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  margin: 0; /* 防止textarea的默认外边距 */
}

.edit-textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 修改表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th, td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
}

/* 设置各列宽度 */
th:nth-child(1), td:nth-child(1) { width: 35%; }
th:nth-child(2), td:nth-child(2) { width: 15%; }
th:nth-child(3), td:nth-child(3) { width: 20%; }
th:nth-child(4), td:nth-child(4) { width: 20%; }
th:nth-child(5), td:nth-child(5) { width: 10%; }

/* 添加表格内容过长时的滚动条样式 */
.task-list {
  overflow-x: auto;
  max-height: calc(90vh - 200px);
}

.task-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.task-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 优化按钮布局 */
td:last-child {
  white-space: nowrap;
  text-align: center;
}

/* 状态选择器样式优化 */
td select {
  width: 100%;
  max-width: 120px;
}
</style> 