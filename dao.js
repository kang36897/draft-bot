const sqlite3 = require('sqlite3')
const Promise = require("bluebird")

class AppDao {
    constructor(dbFilePath) {
        this.db = new sqlite3.Database(dbFilePath, (error) => {
            if (error != null) {
                console.log("database is not opened successfully")
            } else {
                console.log("connect to database successfully")
            }

        });
    }


    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (error) {
                if (error != null) {
                    console.log('Error running sql ' + sql)
                    console.error(error)
                    reject(error)
                } else {
                    resolve({ id: this.lastID })
                }
            })
        })
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    console.log('Error running sql: ' + sql)
                    console.log(err)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.log('Error running sql: ' + sql)
                    console.log(err)
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }
}


module.exports = AppDao