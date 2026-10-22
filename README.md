# 2. To-Do List App README Content (`mass-todo-app/README.md`)

```markdown
# TaskMaster Pro - Interactive Mass To-Do List Application

TaskMaster Pro is an advanced, enterprise-grade task management workspace web app. It provides an intuitive interface for handling mass task entries, tracking subtasks, filtering by priority/category, and persisting data across browser sessions.

---
Link for To-Do-List :
## 🌟 Key Features

- **Full Task Lifecycle (CRUD):** Create, view, edit, toggle status, and delete tasks dynamically via DOM manipulation.
- **Subtask Breakdown:** Add and manage nested subtasks with individual progress toggles for each task.
- **Data Persistence:** Automatically syncs tasks and completion status to browser `localStorage`.
- **JSON Export & Import:** Backup your workspace data to a JSON file or restore tasks from an existing backup.
- **Dashboard Analytics:** Live metrics tracking Total, Pending, Completed, and Overdue tasks alongside a visual progress bar.
- **Search, Filter & Sort:**
  - Real-time instant search bar.
  - Multi-category filtering (*Work*, *Personal*, *Learning*, *Urgent*).
  - Sorting options by *Newest*, *Oldest*, *Due Date*, or *Priority*.
- **Theme Customization:** Toggle between Light Mode and Dark Mode with persistent theme saving.
- **Toast Notifications:** Feedback popups for actions like saving, importing, clearing, or deleting tasks.

---

## 🛠️ Technical Stack

- **Structure:** HTML5 Semantic Layout
- **Styling:** CSS3 (Custom CSS Variables, Dark/Light Themes, Flexbox & Grid)
- **Logic:** Vanilla JavaScript (DOM API, Array Higher-Order Functions, LocalStorage API, File API)
- **Icons:** Font Awesome 6.4

---

## 📂 Project Structure

```text
mass-todo-app/
├── index.html        # Main dashboard UI structure & modals
├── styles.css        # Responsive layout, themes, and UI component styles
