const db = require("../models/db");

class DiscountCode {
    static async getAll() {
        const [rows] = await db.promise().query("SELECT * FROM discount_codes");
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.promise().query("SELECT * FROM discount_codes WHERE id = ?", [id]);
        return rows.length ? rows[0] : null;
    }

    static async create(code, discount_percentage, expiration_date, quantitydiscount) {
        const [result] = await db.promise().query(
            "INSERT INTO discount_codes (code, discount_percentage, expiration_date, quantitydiscount) VALUES (?, ?, ?, ?)", 
            [code, discount_percentage, expiration_date, quantitydiscount]
        );
        return result;
    }

    static async update(id, code, discount_percentage, expiration_date, quantitydiscount) {
        const [result] = await db.promise().query(
            "UPDATE discount_codes SET code = ?, discount_percentage = ?, expiration_date = ?, quantitydiscount = ? WHERE id = ?", 
            [code, discount_percentage, expiration_date, quantitydiscount, id]
        );
        return result;
    }

    static async delete(id) {
        const [result] = await db.promise().query("DELETE FROM discount_codes WHERE id = ?", [id]);
        return result;
    }
    
}

module.exports = DiscountCode;