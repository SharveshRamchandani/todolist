export class Task {
    constructor({
        id = crypto.randomUUID(),
        title = '',
        description = '',
        status = 'todo', // todo, in-progress, completed
        priority = 'medium', // low, medium, high, urgent
        category = 'personal', // study, coding, internship, hackathon, personal, custom
        startDate = null, // ISO Date string (YYYY-MM-DD)
        startTime = null, // HH:mm format
        endDate = null,
        endTime = null,
        estimatedDuration = 0, // in minutes
        isRecurring = false,
        recurrenceRule = null, // { frequency: 'daily', interval: 1, ... }
        progressPercentage = 0,
        energyLevel = 'medium', // low, medium, high
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

    // Helper to get a full Date object if start date/time are present
    getStartDateTime() {
        if (!this.startDate) return null;
        const dateStr = this.startTime ? `${this.startDate}T${this.startTime}` : `${this.startDate}T00:00:00`;
        return new Date(dateStr);
    }
}
