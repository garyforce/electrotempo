require("path");
const pool = require("../db");

async function getAll(locationId) {

    const locationIdToCountyMap =
    {
        // TxPPC
        76:  `'Bastrop', 'Bexar', 'Burnet', 'Caldwell', 'Comal', 'Guadalupe', 'Hays', 'Kendall', 'Travis', 'Williamson', 'Wilson'`,
        // Austin Energy
        78: `'Travis', 'Williamson'`,
        // CPS
        79: `'Bexar', 'Comal', 'Kendall'`,
        // NBU
        80: `'Comal'`,
        // LCRA
        81: `'Bastrop', 'Burnet', 'Caldwell', 'Comal', 'Guadalupe', 'Hays', 'Kendall', 'Travis', 'Williamson'`,
    }

    const query = `SELECT * from et_texas.sales_data where county IN (${locationIdToCountyMap[Number(locationId)]})`;
    const results = await pool.query(query);
    const sales = [];
    results.rows.forEach((row) => {
        sales.push(row);
    });
    const geoJSON = {
        type: "SalesCollection",
        sales: sales,
    };
    return geoJSON;
}

module.exports = {
    getAll
};