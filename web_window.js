const express = require('express');
const logger = require("morgan")
const app = express();
const path = require("path")

var robot_status = null
//receive message from parent process
/* the structure of msg object
{
    error: 0, //
    clue: url_address
}
-3 tells that the user logs out of his or her account
-2 states the bot is dead
-1 means in the initial state 
 0 stands for everything is ok 
 1 refers that the user is signed in.
*/
process.on('message', (msg) => {
    console.log("receive robot status")
    robot_status = JSON.parse(msg)
})

app.use(logger("dev"))
app.use(express.static(__dirname + '/public'));



app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});


app.get("/qr_clue", function (req, res) {
    res.type('application/json');

    if (robot_status == null) {
        res.json({ error: -1 })
        return
    }

    res.json(robot_status)
});


app.listen(3000, function () {
    console.log('Bot app listening on port 3000!');
});

