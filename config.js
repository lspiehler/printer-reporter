require('dotenv').config()

module.exports = {
    DBHOST: process.env.DBHOST,
    DBUSER: process.env.DBUSER,
    DBPASS: process.env.DBPASS,
    DBNAME: process.env.DBNAME,
    DBPORT: process.env.DBPORT || 3306
}