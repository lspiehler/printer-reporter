const database = require('./database');

var appRouter = function (app) {
    app.get('/printer_report_API.vbs', function(req, res){
        const file = `${__dirname}/printer_report_API.vbs`;
        res.download(file); // Set disposition and send it.
    });
    app.post("/printers", function(req, res) {
        console.log(req.body.printers);
        let sqlprinters = [];
        for(let i = 0; i <= req.body.printers.length - 1; i++) {
            let splitprinter = req.body.printers[i].split('\\');
            if(splitprinter.length <= 2) {
                console.error('Invalid printer sent by ' + req.body.COMPUTERNAME + ': ' + req.body.printers[i] )
                continue;
            }
            sqlprinters.push([req.body.COMPUTERNAME, splitprinter[2], splitprinter[3]]);
        }
        let params = {
            sql: "DELETE FROM `printers` WHERE `COMPUTERNAME` = '" + req.body.COMPUTERNAME + "'",
            values: [sqlprinters]
        }
        database.query(params, function(err, sql) {
            //console.log(err);
            //console.log(sql);
            if(err) {
                console.error(err);
                console.error(req.body);
                res.status(500).json({result: "error", message: err});
            } else {
                let params = {
                    sql: "INSERT INTO `printers` (`computername`, `printserver`, `printername`) VALUES ?",
                    values: [sqlprinters]
                }
                database.query(params, function(err, sql) {
                    //console.log(err);
                    //console.log(sql);
                    if(err) {
                        console.error(err);
                        console.error(req.body);
                        res.status(500).json({result: "error", message: err});
                    } else {
                        res.status(200).json({result: "success", message: req.body});
                    }
                });
            }
        });
    });
}
  
  module.exports = appRouter;