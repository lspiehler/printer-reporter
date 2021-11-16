const mysql = require('mysql');
const config = require('./config');

var pool;

module.exports = {
	getPool: function () {
		if (pool) return pool;
		pool = mysql.createPool({
			host     : config.DBHOST,
			user     : config.DBUSER,
			password : config.DBPASS,
			database : config.DBNAME,
			charset : 'utf8mb4',
			port: config.DBPORT,
			typeCast: function castField(field, useDefaultTypeCasting) {
				// We only want to cast bit fields that have a single-bit in them. If the field
				// has more than one bit, then we cannot assume it is supposed to be a Boolean.
				if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {

				var bytes = field.buffer();

				// A Buffer in Node represents a collection of 8-bit unsigned integers.
				// Therefore, our single "bit field" comes back as the bits '0000 0001',
				// which is equivalent to the number 1.
				return( bytes[ 0 ] === 1 );

				}

				return( useDefaultTypeCasting() );
			}
		});
		return pool;
	},
    query: function(params, callback) {
        this.getPool().getConnection(function(err, connection) {
            if(err) {
                //console.log(callback);
                //console.log(err);
                callback(err, false, false);
                return;
            }
            let query = connection.query(params.sql, params.values, function(err, results, rows) {
                //connection.query(sql, values, function(err, results, rows) {
                //console.log(query.sql);
                connection.release();
                if(err) {
                    callback(err, { results: results, rows: rows, query: query.sql });
                } else {
                    callback(false, { results: results, rows: rows, query: query.sql });
                }
            });
        });
    }
};
