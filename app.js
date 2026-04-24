const STORAGE_KEY = "cursor.todo.items.v1";

/** @typedef {{ id: string, title: string, completed: boolean, createdAt: number, updatedAt: number }} Todo */

/** @returns {Todo[]} */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @param {Todo[]} todos */
function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

const els = {
  form: document.getElementById("addForm"),
  input: document.getElementById("newTodo"),
  list: document.getElementById("list"),
  count: document.getElementById("count"),
  exportBtn: document.getElementById("exportBtn"),
  importInput: document.getElementById("importInput"),
  clearCompletedBtn: document.getElementById("clearCompletedBtn"),
  filterChips: Array.from(document.querySelectorAll("[data-filter]")),
};

let todos = loadTodos();
/** @type {"all"|"active"|"completed"} */
let filter = "all";

function setFilter(next) {
  filter = next;
  for (const chip of els.filterChips) {
    const pressed = chip.getAttribute("data-filter") === filter;
    chip.setAttribute("aria-pressed", pressed ? "true" : "false");
  }
  render();
}

function visibleTodos() {
  if (filter === "active") return todos.filter((t) => !t.completed);
  if (filter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function render() {
  els.list.innerHTML = "";

  const items = visibleTodos();
  for (const t of items) {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.id = t.id;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "checkbox";
    cb.checked = t.completed;
    cb.addEventListener("change", () => toggle(t.id, cb.checked));

    const title = document.createElement("div");
    title.className = "title" + (t.completed ? " completed" : "");
    title.textContent = t.title;
    title.title = "Double-click to edit";
    title.addEventListener("dblclick", () => startEdit(t.id, title));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "icon-btn danger";
    del.textContent = "Delete";
    del.addEventListener("click", () => remove(t.id));

    li.append(cb, title, del);
    els.list.appendChild(li);
  }

  const remaining = todos.filter((t) => !t.completed).length;
  els.count.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
}

function add(title) {
  const now = Date.now();
  /** @type {Todo} */
  const t = { id: uid(), title, completed: false, createdAt: now, updatedAt: now };
  todos = [t, ...todos];
  saveTodos(todos);
  render();
}

function toggle(id, completed) {
  const now = Date.now();
  todos = todos.map((t) => (t.id === id ? { ...t, completed, updatedAt: now } : t));
  saveTodos(todos);
  render();
}

function remove(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos(todos);
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos(todos);
  render();
}

function startEdit(id, titleEl) {
  const t = todos.find((x) => x.id === id);
  if (!t) return;

  const input = document.createElement("input");
  input.className = "input";
  input.value = t.title;
  input.maxLength = 200;

  const commit = () => {
    const next = input.value.trim();
    if (!next) {
      remove(id);
      return;
    }
    const now = Date.now();
    todos = todos.map((x) => (x.id === id ? { ...x, title: next, updatedAt: now } : x));
    saveTodos(todos);
    render();
  };

  const cancel = () => render();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  });
  input.addEventListener("blur", commit);

  titleEl.replaceWith(input);
  input.focus();
  input.select();
}

function exportTodos() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    todos,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "todos-export.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function importTodos(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const incoming = Array.isArray(parsed) ? parsed : parsed?.todos;
  if (!Array.isArray(incoming)) throw new Error("Invalid import file");

  const normalized = incoming
    .filter((t) => t && typeof t.title === "string")
    .map((t) => ({
      id: typeof t.id === "string" ? t.id : uid(),
      title: String(t.title).slice(0, 200),
      completed: Boolean(t.completed),
      createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
      updatedAt: typeof t.updatedAt === "number" ? t.updatedAt : Date.now(),
    }));

  const byId = new Map(todos.map((t) => [t.id, t]));
  for (const t of normalized) byId.set(t.id, t);
  todos = Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt);
  saveTodos(todos);
  render();
}

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = els.input.value.trim();
  if (!title) return;
  add(title);
  els.input.value = "";
  els.input.focus();
});

for (const chip of els.filterChips) {
  chip.addEventListener("click", () => setFilter(chip.getAttribute("data-filter")));
}

els.clearCompletedBtn.addEventListener("click", clearCompleted);
els.exportBtn.addEventListener("click", exportTodos);
els.importInput.addEventListener("change", async () => {
  const file = els.importInput.files?.[0];
  els.importInput.value = "";
  if (!file) return;
  try {
    await importTodos(file);
  } catch (err) {
    alert("Import failed: " + (err?.message || String(err)));
  }
});

render();

