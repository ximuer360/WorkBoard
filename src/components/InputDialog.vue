<template>
  <div v-if="show" class="dialog-overlay">
    <div class="dialog-content">
      <h3>{{ title }}</h3>
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        @keyup.enter="handleConfirm"
        @keyup.esc="handleCancel"
      />
      <div class="dialog-buttons">
        <button @click="handleCancel">取消</button>
        <button @click="handleConfirm" :disabled="!inputValue.trim()">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  show: boolean;
  title: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'confirm', value: string): void;
  (e: 'cancel'): void;
}>();

const inputValue = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (props.show) {
    inputRef.value?.focus();
  }
});

const handleConfirm = () => {
  if (inputValue.value.trim()) {
    emit('confirm', inputValue.value.trim());
    inputValue.value = '';
  }
};

const handleCancel = () => {
  inputValue.value = '';
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
  min-width: 300px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

h3 {
  margin: 0 0 16px 0;
  color: #1f1f1f;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

button {
  padding: 4px 15px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

button:last-child {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

button:hover {
  opacity: 0.8;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 