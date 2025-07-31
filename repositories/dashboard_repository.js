import { Result } from "../common/result.js";
import { Database } from "../source/database.js";

export class DashboardRepository {
    constructor() {
        this.db = new Database();
    }

    async getProfitByDateRange(beginDate, endDate) {
        const sql = `
            SELECT \`Pickup Date\` AS Fecha, SUM(Profit) AS Profit_Diario
            FROM gtt_finance.tbl_qf_src
            WHERE \`Pickup Date\` BETWEEN ? AND ?
            GROUP BY \`Pickup Date\`
            ORDER BY \`Pickup Date\` ASC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const xAxis = rows.map(row => {
                const date = new Date(row.Fecha);
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const dayName = daysShort[date.getDay()];
                return `${yyyy}-${mm}-${dd} (${dayName})`;
            });
            const yAxis = rows.map(row => String(row.Profit_Diario));

            return Result.ok({ xAxis, yAxis });
        } catch (error) {
            return Result.fail(error.message);
        }
    }

    async getCostByDateRange(beginDate, endDate) {
        const sql = `
            SELECT \`Pickup Date\` AS Fecha, SUM(Cost) AS Costo_Diario
            FROM gtt_finance.tbl_qf_src
            WHERE \`Pickup Date\` BETWEEN ? AND ?
            GROUP BY \`Pickup Date\`
            ORDER BY \`Pickup Date\` ASC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const xAxis = rows.map(row => {
                const date = new Date(row.Fecha);
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const dayName = daysShort[date.getDay()];
                return `${yyyy}-${mm}-${dd} (${dayName})`;
            });
            const yAxis = rows.map(row => String(row.Costo_Diario));

            return Result.ok({ xAxis, yAxis });
        } catch (error) {
            return Result.fail(error.message);
        }
    }
}
