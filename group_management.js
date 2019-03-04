const Session = require("./session_variety")



class GroupManager {
    constructor(group_name, warehouse) {
        this.group_name = group_name
        this.current_session = new Session(warehouse)
    }


    filterMessage(group) {
        if (group !== this.group_name) {
            return false
        }
        return true
    }

    handleTextMessage(contact, room, text) {
        if (!this.current_session.isCorrelatedWith(text)) {
            this.current_session.updateSessionState(room);
            return
        }

        this.current_session.doConsumeText(room, contact, text)
    }


    async hanldeImageMessage(contact, room, msg) {
        var fileBox = await msg.toFileBox()
        this.current_session.doConsumeImage(room, contact, fileBox)
    }

    checkGroupNicknameByConvention(name) {
        return false
    }

    async dealWith(msg, bot) {
        const contact = msg.from()
        const room = msg.room()

        var group = await room.topic()
        if (!this.filterMessage(group)) {
            return
        }

    



        if (msg.type() === bot.Message.Type.Text) {
            this.handleTextMessage(contact, room, msg.text())
            return
        }

        if (msg.type() === bot.Message.Type.Image) {
            this.hanldeImageMessage(contact, room, msg)
            return
        }
    }

}

module.exports = GroupManager