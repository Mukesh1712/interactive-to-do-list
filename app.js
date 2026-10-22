// State Management
let tasks = [];
let currentCategory = 'ALL';
let currentStatus = 'ALL';
let currentSort = 'dateNewest';
let searchQuery = '';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskListContainer = document.getElementById('taskListContainer');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const themeToggle = document.getElementById('themeToggle');
const toastContainer = document.getElementById('toastContainer');

// Pre-populated Sample Data
const sampleTasks = [
  {
    id: '1',
    title: 'Complete Full-Stack Internship Tasks',
    desc: 'Finish building the Personal Portfolio and Mass To-Do Application.',
    category: 'Work',
    priority: 'High',
    dueDate: '2026-10-30',
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 's1', text: 'Structure portfolio HTML/CSS', completed: true },
      { id: 's2', text: 'Build To-Do List functionality', completed: true },
      { id: 's3', text: 'Test across mobile responsiveness', completed: false }
    ]
  },
  {
    id: '2',
    title: 'Prepare for Placement Drive',
    desc: 'Review Java OOP concepts, Spring Boot REST APIs, and SQL query optimizations.',
    category: 'Learning',
    priority: 'High',
    dueDate: '2026-10-26',
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    subtasks: []
  },
  {
    id: '3',
    title: 'Update GitHub Portfolio Repositories',
    desc: 'Ensure code features clean commits, comprehensive READMEs, and valid links.',
    category: 'Personal',
    priority: 'Medium',
    dueDate: '2026-11-05',
    completed: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    subtasks: []
  }
];

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadTasksFromStorage();
  setupEventListeners();
  loadThemePreference();
  render();
});

// Storage Functions
function loadTasksFromStorage() {
  const data = localStorage.getItem('mass_todo_tasks');
  if (data) {
    tasks = JSON.parse(data);
  } else {
    tasks = sampleTasks;
    saveTasksToStorage();
  }
}

function saveTasksToStorage() {
  localStorage.setItem('mass_todo_tasks', JSON.stringify(tasks));
}

// Event Listeners Setup
function setupEventListeners() {
  // New Task Creation
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const desc = document.getElementById('taskDesc').value.trim();

    if (!title) return;

    const newTask = {
      id: Date.now().toString(),
      title,
      category,
      priority,
      dueDate,
      desc,
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: []
    };

    tasks.unshift(newTask);
    saveTasksToStorage();
    taskForm.reset();
    showToast('Task created successfully!');
    render();
  });

  // Search Input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    render();
  });

  // Sort Option
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    render();
  });

  // Category Selection
  document.querySelectorAll('.category-list li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('.category-list li').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      currentCategory = li.dataset.category;
      render();
    });
  });

  // Status Filter Selection
  document.querySelectorAll('.filter-list li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('.filter-list li').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      currentStatus = li.dataset.status;
      render();
    });
  });

  // Clear Completed
  document.getElementById('clearCompletedBtn').addEventListener('click', () => {
    const beforeCount = tasks.length;
    tasks = tasks.filter(t => !t.completed);
    if (tasks.length < beforeCount) {
      saveTasksToStorage();
      showToast('Completed tasks cleared.');
      render();
    }
  });

  // Theme Switcher
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.body.removeAttribute('data-theme');
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      localStorage.setItem('theme', 'light');
    } else {
      document.body.setAttribute('data-theme', 'dark');
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      localStorage.setItem('theme', 'dark');
    }
  });

  // Export Data JSON
  document.getElementById('exportBtn').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `tasks_backup_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchorElem.click();
    showToast('Tasks exported to JSON file.');
  });

  // Import Data JSON
  const importFileInput = document.getElementById('importFileInput');
  document.getElementById('importBtnTrigger').addEventListener('click', () => importFileInput.click());

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          tasks = imported;
          saveTasksToStorage();
          showToast('Tasks imported successfully!');
          render();
        }
      } catch (err) {
        showToast('Invalid JSON file.', 'danger');
      }
    };
    reader.readAsText(file);
  });

  // Modal Editing Events
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelEditBtn').addEventListener('click', closeModal);
  document.getElementById('editTaskForm').addEventListener('submit', saveModalEdit);
}

// Render Logic
function render() {
  updateMetrics();
  
  let filtered = tasks.filter(task => {
    const matchesCat = currentCategory === 'ALL' || task.category === currentCategory;
    const matchesStatus = currentStatus === 'ALL' || 
      (currentStatus === 'PENDING' && !task.completed) || 
      (currentStatus === 'COMPLETED' && task.completed);
    const matchesSearch = task.title.toLowerCase().includes(searchQuery) || 
      task.desc.toLowerCase().includes(searchQuery);

    return matchesCat && matchesStatus && matchesSearch;
  });

  // Sorting Logic
  filtered.sort((a, b) => {
    if (currentSort === 'dateNewest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (currentSort === 'dateOldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (currentSort === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (currentSort === 'priority') {
      const pOrder = { High: 1, Medium: 2, Low: 3 };
      return pOrder[a.priority] - pOrder[b.priority];
    }
  });

  // Render HTML Cards
  taskListContainer.innerHTML = '';

  if (filtered.length === 0) {
    taskListContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-clipboard-list"></i>
        <h3>No Tasks Found</h3>
        <p>Try tweaking your category filters, search input, or create a new task.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
    
    card.innerHTML = `
      <div class="task-main">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus('${task.id}')">
        <div class="task-content">
          <div class="task-header-line">
            <span class="task-title">${escapeHTML(task.title)}</span>
            <span class="tag tag-category">${task.category}</span>
            <span class="tag tag-priority-${task.priority}">${task.priority}</span>
          </div>
          ${task.desc ? `<p class="task-desc">${escapeHTML(task.desc)}</p>` : ''}
          <div class="task-meta">
            ${task.dueDate ? `<span><i class="fa-regular fa-calendar"></i> Due: ${task.dueDate}</span>` : ''}
            <span><i class="fa-regular fa-clock"></i> Created: ${new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="action-btn" onclick="openEditModal('${task.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" onclick="deleteTask('${task.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>

      <!-- Subtasks Section -->
      <div class="subtasks-container">
        <ul class="subtask-list">
          ${task.subtasks.map(s => `
            <li class="subtask-item ${s.completed ? 'completed' : ''}">
              <input type="checkbox" ${s.completed ? 'checked' : ''} onchange="toggleSubtask('${task.id}', '${s.id}')">
              <span>${escapeHTML(s.text)}</span>
            </li>
          `).join('')}
        </ul>
        <div class="subtask-input-row">
          <input type="text" id="subInput-${task.id}" placeholder="Add a subtask..." onkeypress="handleSubtaskKey(event, '${task.id}')">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick="addSubtask('${task.id}')">Add</button>
        </div>
      </div>
    `;

    taskListContainer.appendChild(card);
  });
}

// Global Operations Function
window.toggleTaskStatus = function(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasksToStorage();
    render();
  }
};

window.deleteTask = function(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasksToStorage();
  showToast('Task removed.');
  render();
};

window.toggleSubtask = function(taskId, subId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    const sub = task.subtasks.find(s => s.id === subId);
    if (sub) {
      sub.completed = !sub.completed;
      saveTasksToStorage();
      render();
    }
  }
};

window.handleSubtaskKey = function(event, taskId) {
  if (event.key === 'Enter') {
    addSubtask(taskId);
  }
};

window.addSubtask = function(taskId) {
  const input = document.getElementById(`subInput-${taskId}`);
  const text = input.value.trim();
  if (!text) return;

  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.subtasks.push({
      id: Date.now().toString(),
      text,
      completed: false
    });
    saveTasksToStorage();
    render();
  }
};

// Modal Functions
window.openEditModal = function(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById('editTaskId').value = task.id;
  document.getElementById('editTaskTitle').value = task.title;
  document.getElementById('editTaskCategory').value = task.category;
  document.getElementById('editTaskPriority').value = task.priority;
  document.getElementById('editTaskDueDate').value = task.dueDate || '';
  document.getElementById('editTaskDesc').value = task.desc || '';

  document.getElementById('editModal').style.display = 'flex';
};

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

function saveModalEdit(e) {
  e.preventDefault();
  const id = document.getElementById('editTaskId').value;
  const task = tasks.find(t => t.id === id);

  if (task) {
    task.title = document.getElementById('editTaskTitle').value.trim();
    task.category = document.getElementById('editTaskCategory').value;
    task.priority = document.getElementById('editTaskPriority').value;
    task.dueDate = document.getElementById('editTaskDueDate').value;
    task.desc = document.getElementById('editTaskDesc').value.trim();

    saveTasksToStorage();
    closeModal();
    showToast('Task updated successfully!');
    render();
  }
}

// Metrics Updating
function updateMetrics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length;

  document.getElementById('statTotal').innerText = total;
  document.getElementById('statPending').innerText = pending;
  document.getElementById('statCompleted').innerText = completed;
  document.getElementById('statOverdue').innerText = overdue;

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('progressBar').style.width = `${percent}%`;
  document.getElementById('progressText').innerText = `${percent}% Completed`;

  // Update Category Badge Counts
  document.getElementById('catCountAll').innerText = total;
  document.getElementById('catCountWork').innerText = tasks.filter(t => t.category === 'Work').length;
  document.getElementById('catCountPersonal').innerText = tasks.filter(t => t.category === 'Personal').length;
  document.getElementById('catCountLearning').innerText = tasks.filter(t => t.category === 'Learning').length;
  document.getElementById('catCountUrgent').innerText = tasks.filter(t => t.category === 'Urgent').length;
}

// Theme Preferences
function loadThemePreference() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
}

// Toast Notifications
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Helpers
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}