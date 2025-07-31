import { Result } from "../common/result.js";
import { Database } from "../source/database.js";

export class QfDashboardRepository {
    constructor() {
        this.db = new Database();
    }

    async loadsByCustomerByDate(beginDate, endDate) {
        const sql = `
            SELECT Customer, COUNT(*) AS Quantity
            FROM gtt_finance.tbl_finance_qf
            WHERE \`Pickup Date\` BETWEEN ? AND ?
            GROUP BY Customer
            ORDER BY Quantity DESC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const xAxis = rows.map(row => row.Customer);
            const yAxis = rows.map(row => String(row.Quantity));

            return Result.ok({ xAxis, yAxis });
        }
        catch (error) {
            return Result.fail(error.message);
        }
    }

    async loadsPerCarrierByDateRange(beginDate, endDate) {
        const sql = `
            SELECT Carrier, COUNT(*) AS Quantity
            FROM gtt_finance.tbl_finance_qf
            WHERE \`Pickup Date\` BETWEEN ? AND ?
            GROUP BY Carrier
            ORDER BY Quantity DESC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const xAxis = rows.map(row => row.Carrier);
            const yAxis = rows.map(row => String(row.Quantity));

            return Result.ok({ xAxis, yAxis });
        }
        catch (error) {
            return Result.fail(error.message);
        }
    }

    async loadsByRangeDate(beginDate, endDate) {
        const sql = `
            SELECT \`Pickup Date\` AS Fecha, COUNT(\`BOL\`) AS Total_BOL
            FROM gtt_finance.tbl_finance_qf
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
            const yAxis = rows.map(row => String(row.Total_BOL));

            return Result.ok({ xAxis, yAxis });
        }
        catch (error) {
            return Result.fail(error.message);
        }
    }

    async loadsPerCityDestinationByDateRange(beginDate, endDate) {
        const sql = `
            SELECT \`Destination City\`, COUNT(\`BOL\`) AS Quantity
            FROM gtt_finance.tbl_finance_qf
            WHERE \`Pickup Date\` BETWEEN ? AND ?
            GROUP BY \`Destination City\`
            ORDER BY Quantity DESC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const xAxis = rows.map(row => row['Destination City']);
            const yAxis = rows.map(row => String(row.Quantity));

            return Result.ok({ xAxis, yAxis });
        }
        catch (error) {
            return Result.fail(error.message);
        }
    }

    async loadsPerCityOriginByDateRange(beginDate, endDate) {
        const sql = `
            SELECT \`Origin City\`, COUNT(\`BOL\`) AS Quantity
            FROM gtt_finance.tbl_finance_qf
            WHERE \`Pickup Date\` BETWEEN ? AND ?
            GROUP BY \`Origin City\`
            ORDER BY Quantity DESC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const xAxis = rows.map(row => row['Origin City']);
            const yAxis = rows.map(row => String(row.Quantity));

            return Result.ok({ xAxis, yAxis });
        }
        catch (error) {
            return Result.fail(error.message);
        }
    }

    async loadsPerStateDestinationByDateRange(beginDate, endDate) {
        const sql = `
            SELECT \`Destination State\`, COUNT(\`BOL\`) AS Quantity
            FROM gtt_finance.tbl_finance_qf
            WHERE \`Pickup Date\` BETWEEN ? AND ?
            GROUP BY \`Destination State\`
            ORDER BY Quantity DESC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const xAxis = rows.map(row => row['Destination State']);
            const yAxis = rows.map(row => String(row.Quantity));

            return Result.ok({ xAxis, yAxis });
        }
        catch (error) {
            return Result.fail(error.message);
        }
    }

    async loadsPerStateOriginByDateRange(beginDate, endDate) {
        const sql = `
            SELECT \`Origin State\`, COUNT(\`BOL\`) AS Quantity
            FROM gtt_finance.tbl_finance_qf
            WHERE \`Pickup Date\` BETWEEN ? AND ?
            GROUP BY \`Origin State\`
            ORDER BY Quantity DESC
            LIMIT 1000
        `;
        try {
            const connection = await this.db.getConnection();
            const [rows] = await connection.execute(sql, [beginDate, endDate]);

            const xAxis = rows.map(row => row['Origin State']);
            const yAxis = rows.map(row => String(row.Quantity));

            return Result.ok({ xAxis, yAxis });
        }
        catch (error) {
            return Result.fail(error.message);
        }
    }
}
