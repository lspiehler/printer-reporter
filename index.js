const express = require('express');
const app = express();
const routes = require("./routes.js");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('swagger.yml');

app.use(express.urlencoded({extended: true})); 
app.use(express.json());

routes(app);

var server = app.listen(3000, function () {
    console.log("app running on port.", server.address().port);
});

var options = {
    //customCssUrl: '/custom.css'
};
  
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));