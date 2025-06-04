const calendar = document.getElementById("calendar");
const planner = document.getElementById("planner");
const selectedDateTitle = document.getElementById("selected-date-title");
const form = document.getElementById("planner-form");
const entryTime = document.getElementById("entry-time");
const planningTime = document.getElementById("planning-time");
const taskDesc = document.getElementById("task-desc");
const taskList = document.getElementById("task-list");
const monthSelect = document.getElementById("month-select");
const yearSelect = document.getElementById("year-select");

let selectedDate = "";
let selectedElement = null;
let currentMonth, currentYear;

function populateMonthYearSelectors() {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const thisYear = new Date().getFullYear();

  for (let i = 0; i < 12; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = monthNames[i];
    monthSelect.appendChild(opt);
  }

  for (let y = thisYear - 5; y <= thisYear + 5; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.text = y;
    yearSelect.appendChild(opt);
  }

  monthSelect.value = new Date().getMonth();
  yearSelect.value = new Date().getFullYear();

  currentMonth = parseInt(monthSelect.value);
  currentYear = parseInt(yearSelect.value);

  monthSelect.addEventListener("change", () => {
    currentMonth = parseInt(monthSelect.value);
    renderCalendar(currentMonth, currentYear);
  });

  yearSelect.addEventListener("change", () => {
    currentYear = parseInt(yearSelect.value);
    renderCalendar(currentMonth, currentYear);
  });
}

function renderCalendar(month, year) {
  calendar.innerHTML = "";
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.className = "date";
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    day.textContent = i;

    if (today.getDate() === i && today.getMonth() === month && today.getFullYear() === year) {
      day.classList.add("today");
    }

    day.onclick = () => {
      if (selectedElement) {
        selectedElement.classList.remove("selected");
      }
      day.classList.add("selected");
      selectedElement = day;
      openPlanner(dateStr);
    };

    calendar.appendChild(day);
  }
}

function openPlanner(dateStr) {
  selectedDate = dateStr;
  selectedDateTitle.textContent = `Planner for ${dateStr}`;
  planner.classList.remove("hidden");
  loadTasks();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const task = {
    entry: entryTime.value,
    plan: planningTime.value,
    desc: taskDesc.value,
  };

  const key = `tasks-${selectedDate}`;
  const existing = JSON.parse(localStorage.getItem(key)) || [];
  existing.push(task);
  localStorage.setItem(key, JSON.stringify(existing));

  form.reset();
  loadTasks();
});

function loadTasks() {
  taskList.innerHTML = "";
  const key = `tasks-${selectedDate}`;
  const tasks = JSON.parse(localStorage.getItem(key)) || [];

  tasks.forEach((task, index) => {
    const taskEl = document.createElement("div");
    taskEl.className = "task";
    taskEl.innerHTML = `
      <strong>Entry:</strong> ${task.entry}<br/>
      <strong>Plan:</strong> ${task.plan}<br/>
      <strong>Task:</strong> <span class="editable" data-index="${index}">${task.desc}</span>
      <button class="delete-btn" data-index="${index}">🗑️</button>
    `;

    taskList.appendChild(taskEl);
  });

  // Delete button
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach(btn => {
    btn.onclick = () => {
      const idx = btn.getAttribute("data-index");
      tasks.splice(idx, 1);
      localStorage.setItem(key, JSON.stringify(tasks));
      loadTasks();
    };
  });

  // Edit on double-click
  const editables = document.querySelectorAll(".editable");
  editables.forEach(span => {
    span.ondblclick = () => {
      const idx = span.getAttribute("data-index");
      const newText = prompt("Edit task description:", span.textContent);
      if (newText !== null) {
        tasks[idx].desc = newText.trim();
        localStorage.setItem(key, JSON.stringify(tasks));
        loadTasks();
      }
    };
  });
}

// Initialize
populateMonthYearSelectors();
renderCalendar(currentMonth, currentYear);
