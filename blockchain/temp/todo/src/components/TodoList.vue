<template>
  <Sortable item-key="id" :list="todos" :options="sortOptions" @end="sortend" tag="ul"
    class="todo-list list-group list-group-flush">
    <template #item="{ element, index }">
      <transition appear name="list">
        <todo-list-item v-if="!element.transitionOut && !element.isDeleted" :todo="element" :key="element.id"
          :index="index" @edit="editTodo" @update="updateTodo" @delete="deleteTodo" @persist="persist"></todo-list-item>
      </transition>
    </template>
  </Sortable>
</template>

<script setup>
import TodoListItem from '../components/TodoListItem.vue';
import { Sortable } from "sortablejs-vue3";

const props = defineProps({
  todos: Array
});
const sortOptions = {
  animation: 450,
  handle: '.drag-handle'
};
const emit = defineEmits(['persist']);

const sortend = (e) => {
  let { oldIndex, newIndex } = e;
  rearrange(oldIndex, newIndex);
}

const rearrange = (oldIndex, newIndex) => {
  if (oldIndex > newIndex) {
    props.todos.splice(newIndex, 0, props.todos[oldIndex]);
    props.todos.splice(oldIndex + 1, 1);
  } else {
    props.todos.splice(newIndex + 1, 0, props.todos[oldIndex]);
    props.todos.splice(oldIndex, 1);
  }

  const todos = props.todos;
  if (todos.length > 1) {
    let reOrderWholeList = false;
    let order;
    const prevOrder = todos[newIndex - 1]?.order;
    const nextOrder = todos[newIndex + 1]?.order;

    if (newIndex === 0) {
      order = Math.floor(nextOrder * 0.5);
      reOrderWholeList = order === 0;
    } else if (newIndex === todos.length - 1) {
      order = prevOrder + 1000;
    } else {
      order = Math.floor((prevOrder + nextOrder) / 2);
      reOrderWholeList = order === prevOrder || order === nextOrder;
    }
    if (reOrderWholeList) {
      reOrderList()
    }
    todos[newIndex].order = order;
  }
  persist();
}

const reOrderList = () => {
  const todos = props.todos;
  let index = 0;
  for (let todo of todos) {
    index++;
    if (todo.isDeleted) continue;
    todo.order = index * 1000;
  }
}

const deleteTodo = (index) => {
  props.todos[index].transitionOut = true;

  setTimeout(() => {
    let theTask = props.todos[index];
    if (theTask.isStoredOnChain) {
      theTask.isDeleted = true;
      rearrange(index, 0);
      props.todos[0].order = 0;
    } else {
      props.todos.splice(index, 1);
    }
    persist();
  }, 500);
}

const persist = () => {
  emit("persist");
}

const updateTodo = (todo, index, editState) => {
  setEditState(props.todos[index], editState);
  persist();
}

const setEditState = (todo, value) => {
  todo.edit = value;
}

const editTodo = (todo) => {
  setEditState(todo, true);
}
</script>

<style scoped>
input[type="text"] {
  padding: 0 !important;
  border: none;
  outline: none !important;
  color: #0a53be;
  font-weight: bold;
}

.isdone span {
  text-decoration: line-through;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
  border-bottom: none !important;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  margin-bottom: -51px;
}
</style>