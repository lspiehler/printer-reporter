const database = require('./database');
const util = require('util')

var appRouter = function (app) {
    app.get('/printer_report_API.vbs', function(req, res){
        const file = `${__dirname}/printer_report_API.vbs`;
        res.download(file); // Set disposition and send it.
    });
    app.post("/printers", function(req, res) {
        var data = [];

        req.on('data', function(chunk) {
            //console.log('here');
            data.push(chunk);
        });

        req.on('error', (e) => {
            console.error(e);
            res.status(200).send('OK')
            //callback(true);
            //return;
        });

        req.on('end', function() {
            let body;
            try {
                body = JSON.parse(data.toString());
                console.log(util.inspect(body, false, null, true /* enable colors */))
            } catch(e) {
                console.log("JSON parse error. Please examine post data from " + req.clientIp + ":");
                console.log(data.toString());
                res.status(200).send('OK')
                return;
            }
        
            let sqlprinters = [];
            let userou = body.userdn.split(',');
            userou.shift();
            let computerou = body.computerdn.split(',');
            computerou.shift();
            for(let i = 0; i <= body.printers.length - 1; i++) {
                let splitprinter = body.printers[i].split('\\');
                if(splitprinter.length <= 2) {
                    console.error('Invalid printer sent by ' + body.COMPUTERNAME + ': ' + body.printers[i] )
                    continue;
                }
                sqlprinters.push([body.COMPUTERNAME, body.USERNAME, body.USERDOMAIN, body.site, userou.join(','), computerou.join(','), req.clientIp, splitprinter[2], splitprinter[3]]);
            }
            let params = {
                sql: "DELETE FROM `printers` WHERE `computername` = ? AND `username` = ?",
                values: [body.COMPUTERNAME, body.USERNAME]
            }
            database.query(params, function(err, sql) {
                //console.log(err);
                //console.log(sql);
                if(err) {
                    console.error(err);
                    console.error(body);
                    res.status(500).json({result: "error", message: err});
                } else {
                    let params = {
                        sql: "INSERT INTO `printers` (`computername`, `username`,  `userdomain`, `site`, `userou`, `computerou`, `ip`, `printserver`, `printername`) VALUES ?",
                        values: [sqlprinters]
                    }
                    database.query(params, function(err, sql) {
                        //console.log(err);
                        //console.log(sql);
                        if(err) {
                            console.error(err);
                            console.error(body);
                            res.status(500).json({result: "error", message: err});
                        } else {
                            res.status(200).json({result: "success", message: body});
                        }
                    });
                }
            });
        });
    });
}
  
  module.exports = appRouter;
