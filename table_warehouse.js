
const IdleItem = require("./goods")

function extractItemFrom(row) {
    var item = new IdleItem(row.owner_id, row.owner_name);
    item._id = row._id;
    item.name = row.item_name;
    item.description = row.description;
    item.photos = row.photos.split(",")
    item.remaining_amount = row.remaining_amount
    return item
}

class Warehouse {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = "CREATE TABLE IF NOT EXISTS warehouse (\
        _id INTEGER PRIMARY KEY AUTOINCREMENT,\
        owner_id TEXT NOT NULL,\
        owner_name TEXT NOT NULL,\
        item_name TEXT,\
        description TEXT,\
        remaining_amount INT DEFAULT 0,\
        photos TEXT,\
        is_acquired INT DEFAULT 0) ";

        return this.dao.run(sql)
    }


    clearTable() {
        const sql = "DELETE FROM warehouse"

        return this.dao.run(sql)
    }

    questAvailableItems() {
        return this.dao.all("SELECT _id, owner_id, owner_name, item_name, description, remaining_amount, photos FROM warehouse WHERE is_acquired = 0 and remaining_amount > 0")
            .then((rows) => {
                return Promise.all(rows.map((row) => extractItemFrom(row)))
            })
    }

    store(item) {
        return this.dao.run("INSERT INTO warehouse(owner_id, owner_name, item_name, description, remaining_amount, photos) VALUES (?, ?, ?, ?, ?, ?)",
            [item.owner_id, item.owner_name, item.name, item.description, item.remaining_amount, item.getPhotoListsInString()]
        )
    }

    update(item) {
        return this.dao.run("UPDATE warehouse SET item_name = ? , description = ?  , remaining_amount = ?, photos = ? WHERE _id = ?",
            [item.name, item.description, item.remaining_amount, item.getPhotoListsInString(), item._id])
    }

    queryAllItems() {
        return this.dao.all("SELECT _id, owner_id, owner_name, item_name, description, remaining_amount, photos FROM warehouse")
            .then((rows) => {
                return Promise.all(rows.map((row) => extractItemFrom(row)))
            })
    }

    queryItemBy(id) {
        return this.dao.get("SELECT _id, owner_id, owner_name, item_name, description, remaining_amount, photos FROM warehouse WHERE _id = ?",
            [id]).then((row) => {
                if (row == null) {
                    return Promise.resolve(null)
                }

                return Promise.resolve(extractItemFrom(row))
            })
    }

    takeOut(id) {
        return this.dao.run("UPDATE warehouse SET is_acquired = 1 WHERE _id = ?",
            [id])
    }

}

module.exports = Warehouse