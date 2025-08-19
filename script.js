const STORAGE_KEY = "taskflow.todos.v1";

let tasks = [];
let currentFilter = "all";

const taskInput = document.getElementById("taskInput");
const tasksContainer = document.getElementById("tasksContainer");
const emptyState = document.getElementById("emptyState");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const filterTabs = document.querySelectorAll(".filter-tab");
const themeToggle = document.getElementById("themeToggle");
const scrollProgress = document.getElementById("scrollProgress");
const notification = document.getElementById("notification");
const taskForm = document.getElementById("taskForm");
const sortBtn = document.getElementById("sortBtn");
const clearBtn = document.getElementById("clearBtn");

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showNotification(message, type = "info") {
    const icon = notification.querySelector(".notification-icon");
    const text = notification.querySelector(".notification-text");
    
    notification.className = `notification ${type}`;
    
    switch(type) {
        case "success":
            icon.className = "notification-icon fas fa-check-circle";
            break;
        case "error":
            icon.className = "notification-icon fas fa-exclamation-circle";
            break;
        case "info":
        default:
            icon.className = "notification-icon fas fa-info-circle";
            break;
    }
    
    text.textContent = message;
    notification.classList.add("show");
    
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
}

function getFilteredTasks() {
    switch(currentFilter) {
        case "pending":
            return tasks.filter(task => !task.completed);
        case "completed":
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    tasksContainer.innerHTML = "";
    
    if (filteredTasks.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
        
        filteredTasks.forEach(task => {
            const taskEl = document.createElement("div");
            taskEl.className = `task ${task.completed ? "done" : ""}`;
            taskEl.dataset.id = task.id;
            
            taskEl.innerHTML = `
                <div class="task-checkbox">
                    <i class="fas fa-check"></i>
                </div>
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-actions">
                    <button class="task-action delete" aria-label="Eliminar tarea">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            const checkbox = taskEl.querySelector(".task-checkbox");
            const deleteBtn = taskEl.querySelector(".task-action.delete");
            
            checkbox.addEventListener("click", () => toggleTask(task.id));
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });
            
            tasksContainer.appendChild(taskEl);
        });
    }
    
    updateStats();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addTask(text) {
    const trimmedText = text.trim();
    if (!trimmedText) return false;
    
    const newTask = {
        id: generateId(),
        text: trimmedText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks(tasks);
    renderTasks();
    showNotification("Tarea agregada correctamente", "success");
    return true;
}

function toggleTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasks(tasks);
    renderTasks();
    
    const message = tasks[taskIndex].completed ? "Tarea completada" : "Tarea marcada como pendiente";
    showNotification(message, "success");
}

function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    tasks.splice(taskIndex, 1);
    saveTasks(tasks);
    renderTasks();
    showNotification("Tarea eliminada", "error");
}

function sortTasks() {
    tasks.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
    });
    
    saveTasks(tasks);
    renderTasks();
    showNotification("Tareas ordenadas", "info");
}

function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
        showNotification("No hay tareas completadas para limpiar", "info");
        return;
    }
    
    tasks = tasks.filter(task => !task.completed);
    saveTasks(tasks);
    renderTasks();
    showNotification(`${completedCount} tareas completadas eliminadas`, "success");
}

function setFilter(filter) {
    currentFilter = filter;
    filterTabs.forEach(tab => {
        tab.classList.toggle("active", tab.dataset.filter === filter);
    });
    renderTasks();
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("taskflow.theme", newTheme);
    
    const icon = themeToggle.querySelector("i");
    icon.className = newTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

function initializeTheme() {
    const savedTheme = localStorage.getItem("taskflow.theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    const icon = themeToggle.querySelector("i");
    icon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

function updateScrollProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    scrollProgress.style.width = `${scrollPercent}%`;
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long' };
    const weekday = now.toLocaleDateString('es-ES', options).toUpperCase();
    const day = now.getDate();
    const month = now.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
    const year = now.getFullYear();
    
    document.getElementById("dateNumber").textContent = day;
    document.getElementById("dateMonth").textContent = month;
    document.getElementById("dateYear").textContent = year;
    document.getElementById("dateText").textContent = weekday;
}

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = taskInput.value;
    if (addTask(text)) {
        taskInput.value = "";
    }
});

filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        setFilter(tab.dataset.filter);
    });
});

themeToggle.addEventListener("click", toggleTheme);
sortBtn.addEventListener("click", sortTasks);
clearBtn.addEventListener("click", clearCompletedTasks);
window.addEventListener("scroll", updateScrollProgress);

taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        taskForm.dispatchEvent(new Event("submit"));
    }
});

document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    updateDate();
    tasks = loadTasks();
    renderTasks();
    updateScrollProgress();
});