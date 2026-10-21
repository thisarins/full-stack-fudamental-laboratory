document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskList = document.getElementById("taskList");
    const taskCounter = document.getElementById("taskCounter");
    const errorMessage = document.getElementById("errorMessage");
    const clearCompletedBtn = document.getElementById("clearCompletedBtn");

    const filterAll = document.getElementById("filterAll");
    const filterActive = document.getElementById("filterActive");
    const filterCompleted = document.getElementById("filterCompleted");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let currentFilter = "all";

    // Initialize display
    renderTasks();

    // Add Task
    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });

    function addTask() {
        const text = taskInput.value.trim();
        if (text === "") {
            errorMessage.classList.remove("d-none");
            return;
        }

        errorMessage.classList.add("d-none");
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks.push(newTask);
        taskInput.value = "";
        saveAndRender();
    }

    // Toggle Complete / Delete Task
    taskList.addEventListener("click", (e) => {
        const target = e.target;
        const li = target.closest("li");
        if (!li) return;
        const id = Number(li.dataset.id);

        if (target.classList.contains("delete-btn")) {
            tasks = tasks.filter(t => t.id !== id);
            saveAndRender();
        } else if (target.classList.contains("task-checkbox")) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = target.checked;
                saveAndRender();
            }
        }
    });

    // Clear Completed
    clearCompletedBtn.addEventListener("click", () => {
        tasks = tasks.filter(t => !t.completed);
        saveAndRender();
    });

    // Filters
    filterAll.addEventListener("click", () => setFilter("all", filterAll));
    filterActive.addEventListener("click", () => setFilter("active", filterActive));
    filterCompleted.addEventListener("click", () => setFilter("completed", filterCompleted));

    function setFilter(filter, button) {
        currentFilter = filter;
        [filterAll, filterActive, filterCompleted].forEach(btn => {
            btn.classList.remove("active", "btn-primary");
            btn.classList.add("btn-outline-primary");
        });
        button.classList.add("active", "btn-primary");
        button.classList.remove("btn-outline-primary");
        renderTasks();
    }

    // Save and Render Helper
    function saveAndRender() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    }

    // Render Tasks
    function renderTasks() {
        taskList.innerHTML = "";

        let filteredTasks = tasks;
        if (currentFilter === "active") {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === "completed") {
            filteredTasks = tasks.filter(t => t.completed);
        }

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<li class="list-group-item empty-message border-0">No tasks yet. Add your first task!</li>`;
        } else {
            filteredTasks.forEach(task => {
                const li = document.createElement("li");
                li.dataset.id = task.id;
                li.className = "list-group-item d-flex justify-content-between align-items-center py-3 border rounded-3 mb-2";

                li.innerHTML = `
                    <div class="form-check d-flex align-items-center gap-2 mb-0">
                        <input class="form-check-input task-checkbox mt-0" type="checkbox" ${task.completed ? "checked" : ""}>
                        <span class="task-text ${task.completed ? "completed-task" : ""}">${escapeHtml(task.text)}</span>
                    </div>
                    <button class="btn btn-danger btn-sm delete-btn px-3">Delete</button>
                `;
                taskList.appendChild(li);
            });
        }

        // Update Counter
        const remainingCount = tasks.filter(t => !t.completed).length;
        taskCounter.textContent = `${remainingCount} remaining`;
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
});