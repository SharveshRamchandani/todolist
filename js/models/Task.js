export class Task {
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
