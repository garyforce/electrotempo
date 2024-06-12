const sales = require("../services/sales-data.service");

async function get(req, res, next) {
    try {
        if (res.locals.jwt === undefined) {
            res.status(401).json({ message: "No authorization token found." });
            return;
        }
        const salesData = await sales.getAll(req.query.locationId);

        res.json(salesData);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    get
};