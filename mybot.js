//import { Wechaty } from '/wechaty'
const {
  Wechaty,
  Contact,
  Friendship,
  Message,
  log
} = require('wechaty')
const AppDao = require("./dao")
const Warehouse = require("./table_warehouse")
const Dispathcer = require("./message_dispatcher")

const Manager = require("./group_management")

const dao = new AppDao("./repository/databse.sqlite3")
const warehouse = new Warehouse(dao)

var child_server = Dispathcer.createNodeInstance('web_window.js')
var channel = child_server.channel
child_server.on("disconnect", () => console.log("the channel is disconnected"))
child_server.on("close", () => console.log("the child process is closed"))

const topic_of_group_concered = process.env.group_name
const manager = new Manager(topic_of_group_concered, warehouse)
const name_convention = "\n**********************************"
  + "请将你的群昵称修改为‘姓名-你自己的幸运数字-你的电话后四位\n"
  + "请放心，你的群昵称只是用来生成唯一标示,你修改之后请不要再改变\n"
  + "举个例子：我叫田黄,我喜欢数字：4,电话后四位是：8234,\n"
  + "那么我的群昵称为‘田黄-04-8234’\n"
  + "**********************************\n";


const greeting_script = "\n**********************************"
  + "我们是个非盈利组织，大家相互分享闲置物品. \n"
  + "如果你想知道怎么分享，请发送&lt;怎么分享&gt;.\n"
  + "如果想获取物品, 请发送&lt;怎么获取&gt;.\n"
  + "**********************************\n";


function onScan(qrcode, status) {
  require('qrcode-terminal').generate(qrcode, { small: true })  // show qrcode on console
  console.log(`origin: "${qrcode}"`)

  
  Dispathcer.sendMessageTo(child_server, { error: 0, clue: qrcode })

  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
  ].join('')

  console.log(qrcodeImageUrl)
}

function onLogin(user) {
  console.log(`${user} login`)
  Dispathcer.sendMessageTo(child_server, { error: 1 })
}

function onLogout(user) {
  console.log(`${user} logout`)
  Dispathcer.sendMessageTo(child_server, { error: -3})
}

function onMessage(msg) {
  console.log(msg.toString())


  const contact = msg.from()
  const text = msg.text()
  const room = msg.room()


  if (room == null) {
    return
  }

  manager.dealWith(msg, bot)
}

async function onHandleFriendship(friendship) {
  console.log('receive friend request');
  switch (friendship.type()) {
    case Friendship.Type.Receive:
      await friendship.accept()
      break

    case Friendship.Type.Confirm:
      if (friendship.hello() === join_group_code) {
        var friend = friendship.contact()
        friend.say("hello," + friend.name())

        if (targetRoom != null) {
          friend.say('bitter water')
        }
      }
      break
  }
}

async function greetingAfterJoin(room, inviteeList, inviter) {
  log.info('Bot', 'EVENT: room-join - Room "%s" got new member "%s", invited by "%s"',
    await room.topic(),
    inviteeList.map(c => c.name()).join(','),
    inviter.name(),
  )
  console.log('bot room-join room id:', room.id)
  const topic = await room.topic()
  if (topic_of_group_concered == topic) {
    await room.say(`欢迎加入 "${topic}"!  "${greeting_script}"`, inviteeList[0])
  }

}

const bot = Wechaty.instance({ name: 'curious-tiger' }) // Singleton
const join_group_code = 'cucumber'
var targetRoom = null

bot.on('scan', onScan)
  .on('login', onLogin)
  .on('logout', onLogout)
  .on('message', onMessage)
  .on('friendship', onHandleFriendship)
  .on('room-join', greetingAfterJoin)
  .start()
  .then(() => {
    console.log("gonna to create tables")
    warehouse.createTable()
  })
  .catch(e => {
    console.error(e)
    Dispathcer.sendMessageTo(child_server, { error: -2 })
    process.exit(1)
  })