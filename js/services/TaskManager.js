import { Task } from '../models/Task.js';

export class TaskManager {
    constructor(storageService) {
        this.storageService = storageService;
        this.tasks = [];
        this.loadTasks();
    }

    loadTasks() {
        const storedData = this.storageService.getData();
        if (storedData && Array.isArray(storedData)) {
            // Assume data is already in new format if accessed via this manager, 
            // but we can add checks or mapping if needed.
            this.tasks = storedData.map(t => new Task(t));
        } else {
            // Check for old legacy data
            const oldData = JSON.parse(localStorage.getItem('tasks'));
            if (oldData) {
                const migrated = this.storageService.migrateFromOldFormat(oldData);
                this.tasks = migrated.map(t => new Task(t));
                this.saveTasks(); // Save immediately in new format
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
        // dateStr format: YYYY-MM-DD
        return this.tasks.filter(t => t.startDate === dateStr);
    }

    getTasksForWeek(startOfWeekDate) {
        // Should return tasks within the week range
        // Requires DateUtils helper to compare ranges properly
        // Placeholder for now
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
