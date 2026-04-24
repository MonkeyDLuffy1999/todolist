// ─── STORAGE KEY ────────────────────────────────────────────────────────────
// A unique label used to save/load our todos in the browser's localStorage.
// localStorage is like a small notepad the browser keeps for your website.
const STORAGE_KEY = "cursor.todo.items.v1";

// ─── GRAB HTML ELEMENTS ──────────────────────────────────────────────────────
// getElementById finds an element on the page by its "id" attribute.
// We store them in variables so we don't have to search the page every time.
const $form  = document.getElementById("addForm");  // The <form> that wraps the input
const $input = document.getElementById("newTodo");  // The text input field
const $list  = document.getElementById("list");     // The <ul> where todos are shown
const $count = document.getElementById("count");    // The "X items left" label

// ─── LOAD SAVED TODOS ────────────────────────────────────────────────────────
// Run readFromStorage() right away so existing todos appear when the page loads.
// "let" is used (not "const") because we will reassign this variable later.
let todos = readFromStorage();

// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// Reads the saved todo list from localStorage.
// Returns an array of todo objects, or an empty array [] if nothing is saved.
function readFromStorage() {
  try {
    // localStorage only stores text, so we saved the array as a JSON string.
    const text = localStorage.getItem(STORAGE_KEY);

    // If nothing has been saved yet, start with an empty list.
    if (!text) return [];

    // JSON.parse converts the JSON text back into a real JavaScript array.
    const data = JSON.parse(text);

    // Safety check: make sure it's actually an array before using it.
    if (Array.isArray(data)) {
      return data;
    } else {
      return [];
    }
  } catch {
    // If anything goes wrong (e.g. corrupted data), start fresh.
    return [];
  }
}

// Saves the current todos array to localStorage.
// JSON.stringify converts the JavaScript array into a text string for storage.
function writeToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Creates a simple unique ID for each new todo.
// Date.now() returns the number of milliseconds since 1 Jan 1970 — always unique.
function makeId() {
  return Date.now().toString();
}

// Redraws the entire todo list on the page.
// This is called whenever todos change (add, toggle, delete).
function render() {
  // Wipe the current list so we can rebuild it cleanly.
  $list.innerHTML = "";

  // forEach loops through every item in the todos array and runs the function once per item.
  todos.forEach(function(todo) {

    // createElement creates a new HTML element — here a <li> (list item).
    const li = document.createElement("li");
    li.className = "item";

    // dataset lets us attach custom data to an HTML element.
    // We store the todo's id so we can find the right todo later when the user clicks something.
    li.dataset.id = todo.id;

    // ── Checkbox ──────────────────────────────────────────────────────────────
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    // If this todo is already completed, the checkbox will appear pre-ticked.
    checkbox.checked = todo.completed;

    // addEventListener listens for a specific event ("change") and runs a function when it fires.
    checkbox.addEventListener("change", function() {
      toggleTodo(todo.id, checkbox.checked);
    });

    // ── Title text ────────────────────────────────────────────────────────────
    const title = document.createElement("div");
    // Add the "completed" CSS class to draw a strikethrough when the todo is done.
    if (todo.completed) {
      title.className = "title completed";
    } else {
      title.className = "title";
    }
    // textContent sets the visible text inside the element.
    title.textContent = todo.title;

    // ── Delete button ─────────────────────────────────────────────────────────
    const del = document.createElement("button");
    del.type = "button";
    del.className = "icon-btn danger";
    del.textContent = "Delete";
    del.addEventListener("click", function() {
      deleteTodo(todo.id);
    });

    // append() adds multiple child elements inside the <li> in one go.
    li.append(checkbox, title, del);

    // appendChild adds the completed <li> into the <ul> on the page.
    $list.appendChild(li);
  });

  // Count how many todos are NOT yet completed.
  // filter() returns a new array containing only items where the test is true.
  const remaining = todos.filter(function(t) {
    return !t.completed;
  }).length;

  // Update the counter text.
  // Ternary operator syntax:  condition ? valueIfTrue : valueIfFalse
  // Here it picks "item" vs "items" depending on the count.
  $count.textContent = remaining + (remaining === 1 ? " item left" : " items left");
}

// Creates a new todo object and adds it to the front of the list.
function addTodo(title) {
  const now = Date.now();

  // An object groups related data together using  key: value  pairs.
  const newTodo = {
    id:        makeId(),
    title:     title,     // The text the user typed
    completed: false,     // New todos always start as not completed
    createdAt: now,
    updatedAt: now,
  };

  // unshift() adds an item to the BEGINNING of an array (opposite of push, which adds to the end).
  todos.unshift(newTodo);

  writeToStorage(); // Persist the change to localStorage
  render();         // Refresh the page to show the new todo
}

// Flips a todo between completed (true) and not completed (false).
function toggleTodo(id, completed) {
  const now = Date.now();

  // map() loops through every item and returns a brand-new array.
  // We update the matching todo and leave all others unchanged.
  todos = todos.map(function(t) {
    if (t.id === id) {
      t.completed = completed; // Update the completed status
      t.updatedAt = now;       // Record when it was last changed
    }
    return t; // Always return the item (changed or not)
  });

  writeToStorage();
  render();
}

// Removes a todo from the list permanently.
function deleteTodo(id) {
  // filter() keeps every todo EXCEPT the one we want to delete.
  // !== means "not equal to", so we keep every item whose id doesn't match.
  todos = todos.filter(function(t) {
    return t.id !== id;
  });

  writeToStorage();
  render();
}

// ─── FORM SUBMIT EVENT ───────────────────────────────────────────────────────
// This runs when the user presses Enter or clicks the Add button.
$form.addEventListener("submit", function(e) {
  // By default, submitting a form reloads the page. preventDefault() stops that.
  e.preventDefault();

  // .trim() removes any leading/trailing whitespace the user may have typed.
  const title = $input.value.trim();

  // Do nothing if the input is blank.
  if (!title) return;

  addTodo(title);    // Add the new todo to the list
  $input.value = ""; // Clear the input field
  $input.focus();    // Move the cursor back to the input, ready for the next task
});

// ─── INITIAL RENDER ──────────────────────────────────────────────────────────
// Draw the list once when the page first loads so saved todos are shown immediately.
render();
