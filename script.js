let tasks = JSON.parse(localStorage.getItem("planpulse_full_tasks")) || [];
let editTaskId = null;
let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const taskCategory = document.getElementById("taskCategory");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const themeToggle = document.getElementById("themeToggle");
const greeting = document.getElementById("greeting");

// Initialize Greeting
function setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) greeting.textContent = "Good Morning ☀️";
    else if (hour < 18) greeting.textContent = "Good Afternoon 🌤️";
    else greeting.textContent = "Good Evening 🌙";
}

function saveTasks() {
    localStorage.setItem("planpulse_full_tasks", JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = "";
    const query = searchInput.value.toLowerCase().trim();

    const filtered = tasks.filter(t => {
        const matchesFilter = currentFilter === "pending" ? !t.completed :
                              currentFilter === "completed" ? t.completed : true;
        const matchesSearch = t.text.toLowerCase().includes(query);
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        emptyState.classList.add("show");
    } else {
        emptyState.classList.remove("show");
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-card ${task.completed ? "completed" : ""}`;

        li.onclick = (e) => {
            if (!e.target.closest('.action-btn')) {
                toggleTask(task.id);
            }
        };

        li.innerHTML = `
            <div class="task-info">
                <span class="task-title">${escapeHtml(task.text)}</span>
                <div class="task-meta">
                    <span class="cat-pill">${task.category}</span>
                    ${task.date ? `<span><i class="fa-regular fa-calendar"></i> ${task.date}</span>` : ""}
                    ${task.time ? `<span><i class="fa-regular fa-clock"></i> ${task.time}</span>` : ""}
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn" onclick="editTask(${task.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn" onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        taskList.appendChild(li);
    });

    updateProgress();
}

function updateProgress() {
    if (tasks.length === 0) {
        progressFill.style.width = "0%";
        progressPercent.textContent = "0%";
        return;
    }
    const completedCount = tasks.filter(t => t.completed).length;
    const percentage = Math.round((completedCount / tasks.length) * 100);
    progressFill.style.width = `${percentage}%`;
    progressPercent.textContent = `${percentage}%`;
}

function toggleTask(id) {
    tasks = tasks.map(t => {
        if (t.id === id) {
            const nextCompleted = !t.completed;
            if (nextCompleted && window.confetti) {
                confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
            }
            return { ...t, completed: nextCompleted };
        }
        return t;
    });
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    taskInput.value = task.text;
    taskCategory.value = task.category;
    if (task.date) { taskDate.type = "date"; taskDate.value = task.date; }
    taskTime.value = task.time || "";

    editTaskId = id;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    if (editTaskId) {
        tasks = tasks.map(t => t.id === editTaskId ? {
            ...t,
            text,
            date: taskDate.value,
            time: taskTime.value,
            category: taskCategory.value
        } : t);
        editTaskId = null;
    } else {
        tasks.unshift({
            id: Date.now(),
            text,
            date: taskDate.value,
            time: taskTime.value,
            category: taskCategory.value,
            completed: false
        });
    }

    saveTasks();
    renderTasks();
    taskForm.reset();
});

// Theme Toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    themeToggle.innerHTML = isDark ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
});

// Search & Filter Listeners
searchInput.addEventListener("input", renderTasks);

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

setGreeting();
renderTasks();