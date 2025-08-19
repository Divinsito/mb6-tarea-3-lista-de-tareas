// ---- Configuración ----
const STORAGE_KEY = "taskflow.todos.v1";

// ---- Estado ----
let tasks = []; // cada tarea = { id, text, completed }

// ---- Elementos del DOM ----
const taskInput = document.getElementById("taskInput");
const tasksContainer = document.getElementById("tasksContainer");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const filterTabs = document.querySelectorAll(".filter-tab");

// ---- API simulada con localStorage ----
async function apiGET() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function apiPOST(newTask) {
  const data = await apiGET();
  data.push(newTask);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return newTask;
}

function apiSaveAll(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// ---- Renderizado ----
function renderTasks(filter = "all") {
  tasksContainer.innerHTML = "";

  let filtered = tasks;
  if (filter === "pending") {
    filtered = tasks.filter(t => !t.completed);
  } else if (filter === "completed") {
    filtered = tasks.filter(t => t.completed);
  }

  if (filtered.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    filtered.forEach(task => {
      const taskEl = document.createElement("div");
      taskEl.className = "task" + (task.completed ? " done" : "");
      taskEl.dataset.id = task.id;

      // checkbox
      const checkbox = document.createElement("div");
      checkbox.className = "task-checkbox";
      checkbox.innerHTML = '<i class="fas fa-check"></i>';
      checkbox.addEventListener("click", () => toggleTask(task.id));

      // texto
      const text = document.createElement("div");
      text.className = "task-text";
      text.textContent = task.text;

      // acciones
      const actions = document.createElement("div");
      actions.className = "task-actions";
      const delBtn = document.createElement("button");
      delBtn.className = "task-action delete";
      delBtn.innerHTML = '<i class="fas fa-trash"></i>';
      delBtn.addEventListener("click", () => deleteTask(task.id));
      actions.appendChild(delBtn);

      taskEl.append(checkbox, text, actions);
      tasksContainer.appendChild(taskEl);
    });
  }

  // actualizar contadores
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  totalTasks.textContent = total;
  completedTasks.textContent = done;
  pendingTasks.textContent = total - done;
}

// ---- Operaciones ----
function addNewTask(e) {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now().toString(),
    text,
    completed: false
  };

  tasks.push(newTask);
  apiPOST(newTask);
  taskInput.value = "";
  renderTasks(getActiveFilter());
}

function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  apiSaveAll(tasks);
  renderTasks(getActiveFilter());
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  apiSaveAll(tasks);
  renderTasks(getActiveFilter());
}
// ✅ NUEVO: limpiar toda la lista
function clearAllTasks() {
  tasks = [];
  apiSaveAll(tasks);
  renderTasks(getActiveFilter());
  showNotification("Se borraron todas las tareas", "error");
}


// ---- Filtros ----
function getActiveFilter() {
  const active = document.querySelector(".filter-tab.active");
  return active ? active.dataset.filter : "all";
}

filterTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    filterTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderTasks(tab.dataset.filter);
  });
});

// ---- Inicialización ----
(async function init() {
  tasks = await apiGET();
  renderTasks();
})();
