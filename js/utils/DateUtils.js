export class DateUtils {
    static getToday() {
        return new Date();
    }

    static formatDate(date) {
        // Returns YYYY-MM-DD
        const d = new Date(date);
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
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    static generateMonthGrid(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        
        // Pad start
        const startPadding = firstDay.getDay(); // 0 is Sunday
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }
        
        // Days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    }
}
