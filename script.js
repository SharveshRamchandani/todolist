class DateUtils {
    static getToday() {
        return new Date();
    }

    static formatDate(date) {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;

        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    static getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    static generateMonthGrid(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        const startPadding = firstDay.getDay();
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }

    static getMonthName(monthIndex) {
        return new Date(0, monthIndex).toLocaleString('default', { month: 'long' });
    }
}

class StorageService {
    constructor(storageKey = 'taskmaster_data') {
        this.storageKey = storageKey;
    }

    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    migrateFromOldFormat(oldTasks) {
        if (!Array.isArray(oldTasks)) return [];

        return oldTasks.map(t => {
            return {
                id: t.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
                title: t.text || 'Untitled Task',
                description: '',
                status: t.completed ? 'completed' : 'todo',
                priority: 'medium',
                category: 'personal',
                startDate: null,
                startTime: null,
                endDate: null,
                endTime: null,
                estimatedDuration: 30,
                isRecurring: false,
                recurrenceRule: null,
                progressPercentage: t.completed ? 100 : 0,
                energyLevel: 'medium',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        });
    }
}

class Task {
    constructor({
        id = crypto.randomUUID(),
        title = '',
        description = '',
        status = 'todo',
        priority = 'medium',
        category = 'personal',
        startDate = null,
        startTime = null,
        endDate = null,
        endTime = null,
        estimatedDuration = 0,
        isRecurring = false,
        recurrenceRule = null,
        progressPercentage = 0,
        energyLevel = 'medium',
        createdAt = new Date().toISOString(),
        updatedAt = new Date().toISOString()
    } = {}) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.category = category;
        this.startDate = startDate;
        this.startTime = startTime;
        this.endDate = endDate;
        this.endTime = endTime;
        this.estimatedDuration = estimatedDuration;
        this.isRecurring = isRecurring;
        this.recurrenceRule = recurrenceRule;
        this.progressPercentage = progressPercentage;
        this.energyLevel = energyLevel;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    update(updates) {
        Object.assign(this, updates);
        this.updatedAt = new Date().toISOString();
    }

    toggleComplete() {
        if (this.status === 'completed') {
            this.status = 'todo';
            this.progressPercentage = 0;
        } else {
            this.status = 'completed';
            this.progressPercentage = 100;
        }
        this.updatedAt = new Date().toISOString();
    }

    getStartDateTime() {
        if (!this.startDate) return null;
        const dateStr = this.startTime ? `${this.startDate}T${this.startTime}` : `${this.startDate}T00:00:00`;
        return new Date(dateStr);
    }
}

class TaskManager {
    constructor(storageService) {
        this.storageService = storageService;
        this.tasks = [];
        this.loadTasks();
    }

    loadTasks() {
        const storedData = this.storageService.getData();
        if (storedData && Array.isArray(storedData)) {
            this.tasks = storedData.map(t => new Task(t));
        } else {
            const oldData = JSON.parse(localStorage.getItem('tasks'));
            if (oldData) {
                const migrated = this.storageService.migrateFromOldFormat(oldData);
                this.tasks = migrated.map(t => new Task(t));
                this.saveTasks();
            }
        }
    }

    saveTasks() {
        this.storageService.saveData(this.tasks);
    }

    addTask(taskData) {
        const newTask = new Task(taskData);
        this.tasks.push(newTask);
        this.saveTasks();
        return newTask;
    }

    updateTask(id, updates) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.update(updates);
            this.saveTasks();
            return task;
        }
        return null;
    }

    deleteTask(id) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            this.saveTasks();
            return true;
        }
        return false;
    }

    getTask(id) {
        return this.tasks.find(t => t.id === id);
    }

    getAllTasks() {
        return this.tasks;
    }

    getTasksByDate(dateStr) {
        return this.tasks.filter(t => t.startDate === dateStr);
    }

    getTasksForWeek(startOfWeekDate) {
        return this.tasks;
    }

    getOverdueTasks() {
        const now = new Date();
        return this.tasks.filter(t => {
            if (t.status === 'completed' || !t.startDate) return false;
            const taskDate = t.getStartDateTime();
            return taskDate && taskDate < now;
        });
    }
}

class UI {
    constructor(taskManager) {
        this.tm = taskManager;
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
    }

    cacheDOM() {
        this.viewContainer = document.getElementById('view-container');
        this.pageTitle = document.getElementById('page-title');
        this.navItems = document.querySelectorAll('.nav-item');

        this.modal = document.getElementById('task-modal');
        this.newTaskBtn = document.getElementById('new-task-btn');
        this.closeModalBtns = document.querySelectorAll('.close-btn, .close-modal-btn');
        this.taskForm = document.getElementById('task-form');
    }

    bindEvents() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(item.dataset.view);

                this.navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });

        this.newTaskBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtns.forEach(btn => btn.addEventListener('click', () => this.closeModal()));
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });
    }

    switchView(viewName) {
        this.currentView = viewName;
        this.render();
    }

    render() {
        this.viewContainer.innerHTML = '';

        switch (this.currentView) {
            case 'dashboard':
                this.pageTitle.textContent = 'Dashboard';
                this.renderDashboard();
                break;
            case 'calendar':
                this.pageTitle.textContent = 'Calendar';
                this.renderCalendar();
                break;
            case 'today':
                this.pageTitle.textContent = 'Today\'s Tasks';
                this.renderList('today');
                break;
            case 'upcoming':
                this.pageTitle.textContent = 'Upcoming Tasks';
                this.renderList('upcoming');
                break;
            case 'projects':
                this.pageTitle.textContent = 'Projects';
                this.viewContainer.innerHTML = '<div class="empty-placeholder"><p>Projects View Coming Soon</p></div>';
                break;
            default:
                this.renderDashboard();
        }
    }

    renderDashboard() {
        const dashboardHTML = `
            <div class="dashboard-grid">
                <div class="stat-card">
                    <h3>Today's Focus</h3>
                    <div class="task-list" id="dashboard-today-list"></div>
                </div>
                 <div class="stat-card">
                    <h3>High Priority</h3>
                    <div class="task-list" id="dashboard-priority-list"></div>
                </div>
            </div>
        `;
        this.viewContainer.innerHTML = dashboardHTML;

        const todayStr = DateUtils.formatDate(new Date());
        const todayTasks = this.tm.getTasksByDate(todayStr);
        const priorityTasks = this.tm.getAllTasks().filter(t => t.priority === 'urgent' || t.priority === 'high');

        this.renderTaskItems(todayTasks, document.getElementById('dashboard-today-list'));
        this.renderTaskItems(priorityTasks, document.getElementById('dashboard-priority-list'));
    }

    renderCalendar() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';

        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = `<h2>${DateUtils.getMonthName(month)} ${year}</h2>`;
        calendarContainer.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const el = document.createElement('div');
            el.className = 'calendar-day-header';
            el.textContent = day;
            grid.appendChild(el);
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();

        for (let i = 0; i < startPadding; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day empty';
            grid.appendChild(cell);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            cell.innerHTML = `<span class="day-number">${i}</span>`;

            const dayTasks = this.tm.getTasksByDate(dateStr);
            dayTasks.forEach(task => {
                const dot = document.createElement('div');
                dot.className = `task-dot priority-${task.priority}`;
                dot.title = task.title;
                dot.textContent = task.title;
                cell.appendChild(dot);
            });

            grid.appendChild(cell);
        }

        calendarContainer.appendChild(grid);
        this.viewContainer.appendChild(calendarContainer);
    }

    renderList(filterType) {
        const listContainer = document.createElement('div');
        listContainer.className = 'task-list-view';

        let tasks = [];
        if (filterType === 'today') {
            tasks = this.tm.getTasksByDate(DateUtils.formatDate(new Date()));
        } else if (filterType === 'upcoming') {
            const todayStr = DateUtils.formatDate(new Date());
            tasks = this.tm.getAllTasks().filter(t => t.startDate > todayStr);
        }

        if (tasks.length === 0) {
            listContainer.innerHTML = '<div class="empty-state">No tasks found.</div>';
        } else {
            this.renderTaskItems(tasks, listContainer);
        }

        this.viewContainer.appendChild(listContainer);
    }

    renderTaskItems(tasks, container) {
        if (tasks.length === 0) {
            container.innerHTML = '<p class="text-tertiary">Nothing here yet.</p>';
            return;
        }

        tasks.forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-card';
            el.innerHTML = `
                <div class="task-checkbox ${task.status === 'completed' ? 'checked' : ''}">
                    <i class="fas fa-check"></i>
                </div>
                <div class="task-details">
                    <span class="task-title">${task.title}</span>
                    <span class="task-meta">
                        ${task.startDate ? `<i class="far fa-clock"></i> ${task.startDate}` : ''}
                        <span class="badge ${task.category}">${task.category}</span>
                    </span>
                </div>
                 <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;

            el.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete task?')) {
                    this.tm.deleteTask(task.id);
                    this.render();
                }
            });

            el.querySelector('.task-checkbox').addEventListener('click', () => {
                task.toggleComplete();
                this.tm.saveTasks();
                this.render();
            });

            container.appendChild(el);
        });
    }

    openModal() {
        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.taskForm.reset();
    }

    handleTaskSubmit() {
        const title = document.getElementById('task-title').value;
        const status = document.getElementById('task-status').value;
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value;
        const date = document.getElementById('task-date').value;
        const time = document.getElementById('task-time').value;
        const desc = document.getElementById('task-desc').value;
        const duration = document.getElementById('task-duration').value;

        this.tm.addTask({
            title,
            description: desc,
            status,
            priority,
            category,
            startDate: date,
            startTime: time,
            estimatedDuration: parseInt(duration) || 30
        });

        this.closeModal();
        this.render();
    }
}

const styleInjection = document.createElement('style');
styleInjection.textContent = `
    .calendar-container {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .calendar-header {
         margin-bottom: 1rem;
    }
    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background-color: var(--border-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden;
    }
    .calendar-day-header {
        background-color: var(--bg-card);
        padding: 0.5rem;
        text-align: center;
        font-weight: 600;
        font-size: 0.8rem;
        color: var(--text-tertiary);
    }
    .calendar-day {
        background-color: var(--bg-main);
        min-height: 100px;
        padding: 0.5rem;
        position: relative;
    }
    .calendar-day:hover {
        background-color: var(--bg-card);
    }
    .day-number {
        font-size: 0.8rem;
        color: var(--text-secondary);
        display: block;
        margin-bottom: 0.25rem;
    }
    .task-dot {
        font-size: 0.75rem;
        padding: 2px 4px;
        border-radius: 2px;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background-color: var(--bg-hover);
        color: var(--text-primary);
        cursor: pointer;
    }
    .task-dot.priority-high, .task-dot.priority-urgent {
        background-color: rgba(220, 20, 60, 0.2);
        color: #ff6b6b;
    }

    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    .stat-card {
        background-color: var(--bg-card);
        padding: 1.5rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
    }
    .stat-card h3 {
        margin-bottom: 1rem;
        font-size: 1rem;
        color: var(--text-secondary);
    }
    
    .task-card {
        background-color: var(--bg-main);
        padding: 0.75rem;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
        border: 1px solid transparent;
    }
    .task-card:hover {
        border-color: var(--border-color);
    }
    .task-checkbox {
        width: 18px;
        height: 18px;
        border: 2px solid var(--text-tertiary);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    .task-checkbox i { display: none; font-size: 10px; }
    .task-checkbox.checked {
        background-color: var(--accent-primary);
        border-color: var(--accent-primary);
    }
    .task-checkbox.checked i { display: block; }
    
    .task-details { flex: 1; display: flex; flex-direction: column; }
    .task-title { font-size: 0.95rem; }
    .task-meta { font-size: 0.75rem; color: var(--text-tertiary); display: flex; gap: 0.5rem; align-items: center; margin-top: 2px; }
    
    .badge {
        padding: 1px 4px;
        border-radius: 2px;
        background-color: var(--bg-hover);
        text-transform: capitalize;
    }
`;
document.head.appendChild(styleInjection);


document.addEventListener('DOMContentLoaded', () => {
    const storageService = new StorageService();
    const taskManager = new TaskManager(storageService);

    const ui = new UI(taskManager);

    console.log('TaskMaster initialized');
});
