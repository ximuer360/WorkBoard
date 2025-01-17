<template>
  <div class="kanban-board">
    <div class="board-content">
      <KanbanColumn
        title="待办事宜"
        status="todo"
        :tasks="taskStore.todoTasks"
        @add="addNewTask"
        @updateStatus="updateTaskStatus"
      />
      <KanbanColumn
        title="正在处理"
        status="doing"
        :tasks="taskStore.doingTasks"
        @updateStatus="updateTaskStatus"
      />
      <KanbanColumn
        title="办理完毕"
        status="done"
        :tasks="taskStore.doneTasks"
        @updateStatus="updateTaskStatus"
      />
    </div>

    <div class="board-footer">
      <div class="bottom-buttons">
        <button class="action-btn" @click="handleOrganize">整理</button>
        <button class="action-btn" @click="handleLog">日志</button>
        <button class="action-btn" @click="handleCheck">控制台</button>
      </div>
    </div>
    
    <InputDialog
      v-if="showDialog"
      :show="showDialog"
      @confirm="handleAddTask"
      @cancel="showDialog = false"
    />
    
    <TaskManageDialog
      v-if="showManageDialog"
      :show="showManageDialog"
      :tasks="taskStore.tasks"
      @close="showManageDialog = false"
    />
  </div>
</template>

<style scoped>
.kanban-board {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: #f0f2f5;
}

.board-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
  margin-bottom: 20px;
  height: calc(100vh - 120px);
}

.board-footer {
  height: 60px;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bottom-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  height: 100%;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #1890ff;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  height: 36px;
}

.action-btn:hover {
  background: #40a9ff;
}

/* 添加加载指示器样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTaskStore } from '../stores/taskStore';
import KanbanColumn from './KanbanColumn.vue';
import InputDialog from './InputDialog.vue';
import TaskManageDialog from './TaskManageDialog.vue';

const taskStore = useTaskStore();
const showDialog = ref(false);
const isLoading = ref(false);
const showManageDialog = ref(false);

const addNewTask = () => {
  showDialog.value = true;
};

const handleAddTask = async (title: string, content: string) => {
  try {
    isLoading.value = true;
    await taskStore.addTask(title, content);
    showDialog.value = false;
  } catch (error) {
    console.error('添加任务失败:', error);
    window.alert(error instanceof Error ? error.message : '添加任务失败，请重试');
  } finally {
    isLoading.value = false;
  }
};

const updateTaskStatus = async (taskId: string, status: Task['status']) => {
  try {
    isLoading.value = true;
    await taskStore.updateTaskStatus(taskId, status);
  } catch (error) {
    console.error('更新任务状态失败:', error);
    window.alert('更新任务状态失败，请重试');
  } finally {
    isLoading.value = false;
  }
};

const handleOrganize = () => {
  showManageDialog.value = true;
};

const handleLog = () => {
  // TODO: 实现日志功能
  console.log('日志');
};

const handleCheck = () => {
  // TODO: 实现质检表功能
  console.log('控制台');
};

onMounted(async () => {
  await taskStore.loadTasks();
});
</script> 