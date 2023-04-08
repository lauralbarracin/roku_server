const express = require('express');
const server = express();
const port = process.env.PORT || 5050;

// configure the back end to accept incoming data
// either is JSON payload or as a form data 

server.use(express.json());
server.use(express.urlencoded({
    extended: false
})); //url?key=value&&key=value

server.use('/ums', require('./routes/api'));

server.listen(port, () => {
    console.log(`server is running on ${port}`);
})