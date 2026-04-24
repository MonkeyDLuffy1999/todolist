const STORAGE_KEY = "cursor.todo.items.v1";

const $form = document.getElementById("addForm");
const $input = document.getElementById("newTodo");
const $list = document.getElementById("list");
const $count = document.getElementById("count");

let todos = readFromStorage();

function readFromStorage() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return [];
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function makeId() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function render() {
  $list.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "item enter";
    li.dataset.id = todo.id;

    // Let the browser paint "enter" first, then remove it.
    setTimeout(() => li.classList.remove("enter"), 0);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id, checkbox.checked));

    const title = document.createElement("div");
    title.className = "title" + (todo.completed ? " completed" : "");
    title.textContent = todo.title;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "icon-btn danger";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, title, del);
    $list.appendChild(li);
  });

  const remaining = todos.filter((t) => !t.completed).length;
  $count.textContent = remaining + (remaining === 1 ? " item left" : " items left");
}

function addTodo(title) {
  const now = Date.now();
  todos.unshift({
    id: makeId(),
    title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });
  writeToStorage();
  render();
}

function toggleTodo(id, completed) {
  const now = Date.now();
  todos = todos.map((t) => (t.id === id ? { ...t, completed, updatedAt: now } : t));
  writeToStorage();
  render();
}

function findListItemById(id) {
  return Array.from($list.children).find((el) => el?.dataset?.id === id) || null;
}

function deleteTodo(id) {
  const li = findListItemById(id);
  if (li) {
    li.classList.add("exiting");
    setTimeout(() => {
      todos = todos.filter((t) => t.id !== id);
      writeToStorage();
      render();
    }, 180);
    return;
  }

  todos = todos.filter((t) => t.id !== id);
  writeToStorage();
  render();
}

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $input.value.trim();
  if (!title) return;
  addTodo(title);
  $input.value = "";
  $input.focus();
});

render();

