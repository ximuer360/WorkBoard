<template>
  <div class="kanban-board">
    <div class="board-content">
      <KanbanColumn
        title="待办事宜"
        status="todo"
        :tasks="todoTasks"
        @add="addNewTask"
        @updateStatus="updateTaskStatus"
      />
      <KanbanColumn
        title="正在处理"
        status="doing"
        :tasks="doingTasks"
        @updateStatus="updateTaskStatus"
      />
      <KanbanColumn
        title="办理完毕"
        status="done"
        :tasks="doneTasks"
        @updateStatus="updateTaskStatus"
      />
    </div>
    
    <div class="board-footer">
      <div class="bottom-buttons">
        <button class="action-btn" @click="handleOrganize">
          <img :src="organizeIcon" class="icon" alt="整理" />
          整理
        </button>
        <button class="action-btn" @click="handleLog">
          <img :src="logIcon" class="icon" alt="日志" />
          日志
        </button>
        <button class="action-btn" @click="handleCheck">
          <img :src="checkIcon" class="icon" alt="质检表" />
          质检表
        </button>
      </div>
    </div>

    <!-- 加载指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- 添加对话框组件 -->
    <InputDialog
      :show="showDialog"
      title="添加新任务"
      placeholder="请输入任务名称"
      @confirm="handleAddTask"
      @cancel="showDialog = false"
    />

    <!-- 添加任务管理对话框 -->
    <TaskManageDialog
      :show="showManageDialog"
      :tasks="allTasks"
      @close="showManageDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTaskStore } from '../stores/taskStore';
import { Task } from '../types/task';
import KanbanColumn from './KanbanColumn.vue';
import InputDialog from './InputDialog.vue';
import TaskManageDialog from './TaskManageDialog.vue';

// 导入图片
import organizeIcon from '../assets/organize.png';
import logIcon from '../assets/log.png';
import checkIcon from '../assets/check.png';

const taskStore = useTaskStore();
const { todoTasks, doingTasks, doneTasks } = storeToRefs(taskStore);

// 添加计算属性获取所有任务
const allTasks = computed(() => taskStore.tasks);

const isLoading = ref(false);
const showDialog = ref(false);
const showManageDialog = ref(false);

onMounted(async () => {
  await taskStore.loadTasks();
});

const addNewTask = () => {
  showDialog.value = true;
};

const handleAddTask = async (title: string) => {
  try {
    isLoading.value = true;
    await taskStore.addTask(title);
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

// 修改整理按钮处理函数
const handleOrganize = () => {
  showManageDialog.value = true;
};

const handleLog = () => {
  // TODO: 实现日志功能
  console.log('日志');
};

const handleCheck = () => {
  // TODO: 实现质检表功能
  console.log('质检表');
};
</script>

<style scoped>
.kanban-board {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.board-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0; /* 重要：防止内容溢出 */
  margin-bottom: 20px;
  height: calc(100vh - 120px); /* 减去头部和底部的高度 */
  overflow: hidden; /* 防止内容溢出 */
}

.board-footer {
  height: 60px; /* 固定底部高度 */
  margin-top: auto; /* 将底部推到最下方 */
  background: #f0f2f5;
  border-radius: 8px;
  padding: 10px;
  position: sticky;
  bottom: 0;
  z-index: 10;
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
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #1890ff;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  height: 36px; /* 固定按钮高度 */
}

.action-btn:hover {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:active {
  transform: translateY(0);
}

.icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
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

/* 修改图片引用方式 */
.action-btn img {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}
</style> 