<template>
  <div class="kanban-column">
    <div class="column-header">
      <h3>{{ title }}</h3>
      <button class="add-btn" @click="handleAdd" v-if="status === 'todo'">
        <span>+</span>
      </button>
    </div>
    <div class="tasks-container" @drop="onDrop" @dragover.prevent>
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-item"
        :class="{
          'task-todo': status === 'todo',
          'task-doing': status === 'doing',
          'task-done': status === 'done'
        }"
        draggable="true"
        @dragstart="onDragStart($event, task)"
      >
        {{ task.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Task } from '../types/task';

const props = defineProps<{
  title: string;
  status: Task['status'];
  tasks: Task[];
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'updateStatus', taskId: string, status: Task['status']): void;
}>();

const handleAdd = () => {
  emit('add');
};

const onDragStart = (event: DragEvent, task: Task) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('taskId', task.id);
  }
};

const onDrop = (event: DragEvent) => {
  const taskId = event.dataTransfer?.getData('taskId');
  if (taskId) {
    emit('updateStatus', taskId, props.status);
  }
};
</script>

<style scoped>
.kanban-column {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
}

.column-header h3 {
  margin: 0;
  font-size: 16px;
  position: relative;
  padding-left: 12px;
}

.column-header h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  border-radius: 2px;
}

.kanban-column:nth-child(1) .column-header h3::before {
  background-color: #1890ff;
}

.kanban-column:nth-child(2) .column-header h3::before {
  background-color: #faad14;
}

.kanban-column:nth-child(3) .column-header h3::before {
  background-color: #52c41a;
}

.add-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #1890ff;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background: #40a9ff;
}

.tasks-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  margin-top: 16px;
  height: calc(100% - 60px);
}

.task-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: move;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.task-todo {
  background: #fff;
  border-left: 4px solid #1890ff;
}

.task-todo:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.task-doing {
  background: #fff;
  border-left: 4px solid #faad14;
}

.task-doing:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(250, 173, 20, 0.2);
}

.task-done {
  background: #fff;
  border-left: 4px solid #52c41a;
}

.task-done:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
}

.task-item[draggable="true"]:active {
  cursor: grabbing;
  opacity: 0.8;
}

.task-item {
  position: relative;
  background: white;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: move;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.task-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.task-item:hover::after {
  opacity: 1;
}

.tasks-container::-webkit-scrollbar {
  width: 6px;
}

.tasks-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.tasks-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.tasks-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style> 