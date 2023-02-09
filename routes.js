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
                //console.log(util.inspect(body, false, null, true /* enable colors */))
            } catch(e) {
                console.log("JSON parse error. Please examine post data from " + req.clientIp + ":");
                console.log(data.toString());
                res.status(200).send('OK')
                return;
            }
        
            let sqlprinters = [];
            let userou = body.userdn.split(',OU=');
            userou.shift();
            //console.log(body.default);
            let computerou = body.computerdn.split(',');
            computerou.shift();
            let defaultprinter = false;
            for(let i = 0; i <= body.printers.length - 1; i++) {
                if(body.default && body.printers[i].toUpperCase() == body.default.toUpperCase()) {
                    defaultprinter = true;
                    console.log('Default printer match: ' + body.printers[i]);
                } else {
                    defaultprinter = false;
                }
                let splitprinter = body.printers[i].split('\\');
                if(splitprinter.length <= 2) {
                    console.error('Invalid printer sent by ' + body.COMPUTERNAME + ': ' + body.printers[i] )
                    continue;
                }
                sqlprinters.push([body.COMPUTERNAME, body.USERNAME, body.USERDOMAIN, body.site, 'OU=' + userou.join(',OU='), 'OU=' + computerou.join(',OU='), req.clientIp, splitprinter[2], splitprinter[3], defaultprinter]);
            }
            if(sqlprinters.length > 0) {
                let params = {}
                if(body.COMPUTERNAME.toUpperCase().indexOf("CTX") == 0) {
                    params.sql = "DELETE FROM `printers` WHERE `computername` LIKE ? AND `username` = ?",
                    params.values = ['CTX%', body.USERNAME]
                } else if(body.COMPUTERNAME.toUpperCase().indexOf("VDI") == 0) {
                    params.sql = "DELETE FROM `printers` WHERE `computername` LIKE ? AND `username` = ?",
                    params.values = ['VDI%', body.USERNAME]
                } else if(body.COMPUTERNAME.toUpperCase().indexOf("CVDI") == 0) {
                    params.sql = "DELETE FROM `printers` WHERE `computername` LIKE ? AND `username` = ?",
                    params.values = ['CVDI%', body.USERNAME]
                } else {
                    params.sql = "DELETE FROM `printers` WHERE `computername` = ? AND `username` = ?",
                    params.values = [body.COMPUTERNAME, body.USERNAME]
                }
                database.query(params, function(err, sql) {
                    //console.log(err);
                    //console.log(sql);
                    if(err) {
                        console.log(err);
                        console.log(body);
                        res.status(500).json({result: "error", message: err});
                    } else {
                        let params = {
                            sql: "INSERT INTO `printers` (`computername`, `username`,  `userdomain`, `site`, `userou`, `computerou`, `ip`, `printserver`, `printername`, `default`) VALUES ?",
                            values: [sqlprinters]
                        }
                        database.query(params, function(err, sql) {
                            //console.log(err);
                            //console.log(sql);
                            if(err) {
                                console.log(err);
                                console.log(body);
                                res.status(500).json({result: "error", message: err});
                            } else {
                                res.status(200).json({result: "success", message: body});
                            }
                        });
                    }
                });
            } else {
                console.log("Empty list of printers sent. Please examine post data from " + req.clientIp + ":");
                console.log(data.toString());
            }
        });
    });
}
  
  module.exports = appRouter;
