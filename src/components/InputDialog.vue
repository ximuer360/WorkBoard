<template>
  <div v-if="show" class="dialog-overlay">
    <div class="dialog-content">
      <h3>新建任务</h3>
      <!-- 标题输入 -->
      <input
        ref="titleInputRef"
        v-model="taskData.title"
        type="text"
        placeholder="请输入标题"
        @keyup.enter="focusContent"
      />
      <!-- 内容输入 -->
      <textarea
        ref="contentTextareaRef"
        v-model="taskData.content"
        placeholder="请输入内容（支持多行）"
        class="content-textarea"
        @keyup.ctrl.enter="handleConfirm"
      ></textarea>
      <div class="dialog-buttons">
        <button @click="handleCancel">取消</button>
        <button 
          @click="handleConfirm" 
          :disabled="!taskData.title.trim()"
        >确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm', title: string, content: string): void;
  (e: 'cancel'): void;
}>();

const taskData = reactive({
  title: '',
  content: ''
});

const titleInputRef = ref<HTMLInputElement | null>(null);
const contentTextareaRef = ref<HTMLTextAreaElement | null>(null);

onMounted(() => {
  if (props.show) {
    titleInputRef.value?.focus();
  }
});

const focusContent = () => {
  contentTextareaRef.value?.focus();
};

const handleConfirm = () => {
  if (taskData.title.trim()) {
    emit('confirm', taskData.title.trim(), taskData.content.trim());
    taskData.title = '';
    taskData.content = '';
  }
};

const handleCancel = () => {
  taskData.title = '';
  taskData.content = '';
  emit('cancel');
};
</script>

<style scoped>
.dialog-overlay {
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

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input, .content-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.content-textarea {
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:first-child {
  background: #f5f5f5;
}

button:last-child {
  background: #1890ff;
  color: white;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 