const spawn = require('child_process').spawn;
const path = require("path")

class MessageDispatcher {
    static sendMessageTo(child, msg) {

        if(!child.connected){
            console.error("child is not connnected with parent")
            return
        }

        var to_msg = JSON.stringify(msg)
        console.log("send message to child->" + to_msg)
        child.send(to_msg)
    }

    static createNodeInstance(js_file) {
        console.log("process.argv->"+ process.argv)
        const command = "node"
        const parameters = [path.resolve(js_file)];
        const options = {
            silent: true,
            stdio: ['ignore', 'inherit', 'ignore', 'ipc']
        };
        const child = spawn(command, parameters, options);
        return child
    }

}

module.exports = MessageDispatcher

