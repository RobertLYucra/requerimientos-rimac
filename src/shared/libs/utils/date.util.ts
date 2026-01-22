export class DateUtil {

    private static readonly PERU_OFFSET_HOURS = -5;

    static getPeruDate(date?: Date | string): Date {
        const now = date ? new Date(date) : new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const peruTime = new Date(utc + (3600000 * this.PERU_OFFSET_HOURS));

        return peruTime;
    }

    static toPeruISOString(): string {
        return this.getPeruDate().toISOString();
    }

    static getPeruTimestamp(): number {
        return this.getPeruDate().getTime();
    }

    static formatDate(date: Date | string): string {
        const d = new Date(date);
        return d.toISOString().replace('T', ' ').substring(0, 19);
    }

    static getBusinessDays(startDate: Date | string, endDate: Date | string): number {
        let count = 0;
        const curDate = new Date(new Date(startDate).getTime());
        const end = new Date(endDate);
        while (curDate <= end) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    }

    static getMonthName(date: Date | string): string {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return months[this.getPeruDate(date).getMonth()];
    }

    static daysBetween(date1: Date | string, date2: Date | string): number {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((d1.getTime() - d2.getTime()) / oneDay));
    }

    static addBusinessDays(date: Date | string, days: number): Date {
        let count = 0;
        const resultDate = new Date(new Date(date).getTime());
        while (count < days) {
            resultDate.setDate(resultDate.getDate() + 1);
            const dayOfWeek = resultDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
        }
        return resultDate;
    }
}
