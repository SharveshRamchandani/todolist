export class StorageService {
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
