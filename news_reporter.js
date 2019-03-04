const { FileBox } = require('file-box')

class Reporter {
    constructor(warehouse) {
        this.warehouse = warehouse
    }

    async showAvailableItems(sender) {
        var goods = await this.warehouse.questAvailableItems()
        if (goods.length > 0) {
            var promotion = "现在正在分享的物品有：\n"
            goods.forEach(it => {
                promotion += it.describeSelf()
                promotion += "**************************************\n"
            });

            await sender.say(promotion)
        } else {
            await sender.say("现在还没有可以分享的物品")
        }
    }

    async buildBridge(sender, item_id) {
        if (item_id != null) {
            var answer = "";
            var item = await this.warehouse.queryItemBy(item_id)

            if (item == null) {
                answer = `编号: "${item.name}" 的物品不存在`
                await sender.say(answer)
                return
            }


            if (item.remaining_amount <= 0) {
                answer = `你心爱的物品: "${item.name}" 已经被别人抢先一步`
                await sender.say(answer)
                return
            }


            answer = `物品: "${item.name}"属于 @${item.owner_name},你可以直接联系他.`
            if (!item.hasPhotos()) {
                await sender.say(answer)
                return
            }

            answer = answer + "\n 物品照片如下:"
            await sender.say(answer)
            //show the pictures

            for (var i = 0; i < item.photos.length; i++) {
                var image_path = item.photos[i].trim()

                try {
                    var imageFileBox = FileBox.fromFile(image_path)
                    await sender.say(imageFileBox)
                } catch (e) {
                    console.log("fail to send image: " + image_path)
                    console.error(e)
                }
            }

        } else {
            await sender.say(HINT_AQUIRE_COMMDN)
        }
    }


}

module.exports = Reporter