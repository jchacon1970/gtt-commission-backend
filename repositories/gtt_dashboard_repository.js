import { Result } from "../common/result.js";
import { Database } from "../source/database.js";

export class GttDashboardRepository {
    constructor() {
        this.db = new Database();
    }

    async callVolumePerAgentByDateRange(beginDate, endDate) {
        const sql = `
            SELECT \`User name\` AS agent, COUNT(*) AS call_volume
            FROM tbl_gttapp
            WHERE \`Start time\` BETWEEN ? AND ?
            GROUP BY \`User name\`
            ORDER BY call_volume DESC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const xAxis = rows.map(row => row.agent);
            const yAxis = rows.map(row => String(row.call_volume));

            return Result.ok({ xAxis, yAxis });
        } catch (error) {
            return Result.fail(error.message);
        }
    }

    async totalTimeOnCallPerAgentByDateRange(beginDate, endDate) {
        const sql = `
            SELECT \`User name\` AS agent, SUM(\`Call duration\`) AS total_duration_seconds
            FROM tbl_gttapp
            WHERE \`Start time\` BETWEEN ? AND ?
            GROUP BY \`User name\`
            ORDER BY total_duration_seconds DESC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const xAxis = rows.map(row => row.agent);
            const yAxis = rows.map(row => String(Math.round(row.total_duration_seconds / 60)));

            return Result.ok({ xAxis, yAxis });
        } catch (error) {
            return Result.fail(error.message);
        }
    }

    async averageCallTimePerAgentByDateRange(beginDate, endDate) {
        const sql = `
            SELECT \`User name\` AS agent, AVG(\`Call duration\`) AS avg_duration_seconds
            FROM tbl_gttapp
            WHERE \`Start time\` BETWEEN ? AND ?
            GROUP BY \`User name\`
            ORDER BY avg_duration_seconds DESC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const xAxis = rows.map(row => row.agent);
            const yAxis = rows.map(row => String(Math.round(row.avg_duration_seconds / 60)));

            return Result.ok({ xAxis, yAxis });
        } catch (error) {
            return Result.fail(error.message);
        }
    }

    async callDispositionSummaryByDateRange(beginDate, endDate) {
        const sql = `
            SELECT Disposition AS disposition, COUNT(*) AS count
            FROM tbl_gttapp
            WHERE \`Start time\` BETWEEN ? AND ?
            GROUP BY Disposition
            ORDER BY count DESC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const xAxis = rows.map(row => row.disposition || 'Unknown');
            const yAxis = rows.map(row => String(row.count));

            return Result.ok({ xAxis, yAxis });
        } catch (error) {
            return Result.fail(error.message);
        }
    }

    async callVolumeByDateRange(beginDate, endDate) {
        const sql = `
            SELECT DATE(\`Start time\`) AS call_date, COUNT(*) AS call_volume
            FROM tbl_gttapp
            WHERE \`Start time\` BETWEEN ? AND ?
            GROUP BY call_date
            ORDER BY call_date ASC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const xAxis = rows.map(row => {
                const date = new Date(row.call_date);
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const dayName = daysShort[date.getDay()];
                return `${yyyy}-${mm}-${dd} (${dayName})`;
            });
            const yAxis = rows.map(row => String(row.call_volume));

            return Result.ok({ xAxis, yAxis });
        } catch (error) {
            return Result.fail(error.message);
        }
    }
}
