const Utils = require("./utils")
const IdelItem = require("./goods")
const Reporter = require("./news_reporter")
const md5 = require("md5")

function Session(warehouse) {

    const DEFAULT_IMAGE_REPORITORY = "./repository/images"
    const rex_prefix_statement = "^<我有闲置物品>$"
    const rex_post_statement = "^<有兴趣请直接联系我>$"
    const rex_item_name = "^&(.+)$"
    const rex_description = "^#(.+)$"

    //use regex expression
    const rex_partial_of_claim = "^<我想要&(\\d+)>$"
    const rex_list_command = "^<最近有什么好东西分享>$"

    const reg_ask_for_instruction = "^<怎么分享>$"
    const reg_ask_for_claim = "^<怎么获取>$"

    const rex_remove_item = "^<&(\\d+)获得新生>$"

    const HINT_THERE_IS_PUBLISHER_NOW = "请稍等，已经有人正在分享物品"
    const HINT_PLEASE_END_YOUR_PUBLISHING = `如果已经完成分享，请发送"${rex_post_statement}"`
    const HINT_AQUIRE_COMMAND = "如果想要得到，某件物品请回复'<我想要&36>',36是你想要得到的物品编号."
    const HINT_REMOVE_COMMAND = "请获得物品后，发送'<&36获得新生>',36是你想要得到的物品编号."

    const SHARING_KEY_REXES = [rex_prefix_statement, rex_post_statement, rex_item_name, rex_description]

    const LIST_KEY_REXES = [rex_list_command]
    const AQUIRE_KEY_REXES = [rex_partial_of_claim]

    const ALL_KEY_REXES = [reg_ask_for_instruction, reg_ask_for_claim, rex_remove_item, rex_prefix_statement, rex_post_statement, rex_item_name, rex_description, rex_list_command, rex_partial_of_claim]

    //最长发布时间间隔为3分钟，如果超过时间默认分享完毕
    const MAX_DURATION_FOR_ONE_STATEMENT = 1000 * 60 * 3;

    //物品发布人
    this.current_publisher_name = null;
    this.current_publisher_id = null;

    //计时物品发布
    this.exceed_time_limit = false;
    this.exceed_time_tickers = 3;

    //发布开始后，上一条内容的时间点
    this.since_lastest_publishing = 0;

    //物品
    this.current_item = null;

    this.warehouse = warehouse
    this.reporter = new Reporter(warehouse)

    //indicate whether it is active or not
    this.isValid = function () {
        return this.current_publisher_name == null
    }

    this.isPublishingInProcess = function () {
        return this.current_publisher_name != null
    }

    this.getHowToClaimInstruction = function () {
        return "如果你想知道当前有哪些物品,请发送 '<最近有什么好东西分享>' " + ".\n" + HINT_AQUIRE_COMMAND + "\n" + HINT_REMOVE_COMMAND
    }

    this.getHowToShareInstruction = function () {
        return "如果你想分享某个闲置物品，\n比如苹果,请发送'<我有闲置物品>'开始分享,\n"
            + "然后发送'&苹果'来指定物品,\n" + "发送'#物品描述'， 比如#很甜，很脆,\n" + "最后发送'<有兴趣请直接联系我>'来结束分享.\n"
            + "最好在3分钟到5分钟之内完成这个操作!"
    }

    this.resetState = function () {
        this.current_publisher_id = null;
        this.current_publisher_name = null;
        this.current_item = null;
        this.since_lastest_publishing = 0;
        this.exceed_time_tickers = 3;
        this.exceed_time_limit = false;
    }

    this.isCorrelatedWith = function (text) {
        return Utils.isSensitive(text, ALL_KEY_REXES)
    }

    this.keepPublicationSessionValid = function () {
        if (Math.floor(this.since_lastest_publishing - Date.now()) >= MAX_DURATION_FOR_ONE_STATEMENT) {
            this.exceed_time_limit = true
        } else {
            this.exceed_time_limit = false
        }
    }

    this.updateSessionState = async function (sender) {
        if (!this.isPublishingInProcess()) {
            return
        }

        this.keepPublicationSessionValid()

        if (!this.exceed_time_limit) {
            return
        }

        await sender.say(`@"${this.current_publisher_name}"` + HINT_PLEASE_END_YOUR_PUBLISHING)

        this.exceed_time_tickers = this.exceed_time_tickers - 1

        if (exceed_time_tickers <= 0) {
            this.autoCompletePublishing()
            return
        }

        //extend his sesstion time 
        this.since_lastest_publishing = this.since_lastest_publishing + 60 * 1000
    }

    this.doInitPublishing = async function (contact) {
        //begin publishing goods
        //insert the contact info into the database and return a item id
        this.current_publisher_name = contact.name()
        this.current_publisher_id = md5(this.current_publisher_name)

        this.current_item = new IdelItem(this.current_publisher_id, this.current_publisher_name)

        var data = await this.warehouse.store(this.current_item)
        this.current_item._id = data.id

        this.since_lastest_publishing = Date.now()
    }

    //finish the process
    this.doCompletePublishing = async function () {
        //complete the publishing process automatically
        this.current_item.remaining_amount = 1
        await this.warehouse.update(this.current_item)

        //after exceeding time, restore the state
        this.resetState()
    }

    this.autoCompletePublishing = function () {
        this.doCompletePublishing()
    }



    this.doDirtyWork = async function (text, sender) {

        //finish the process
        if (Utils.isRelated(text, rex_post_statement)) {
            this.doCompletePublishing()

        } else if (Utils.isRelated(text, rex_item_name)) {  //describe the details about the product

            this.current_item.name = Utils.extract(text, rex_item_name)
            await this.warehouse.update(this.current_item)

            //extend the deadline of closing the publishing session
            this.since_lastest_publishing = Date.now()

        } else if (Utils.isRelated(text, rex_description)) {

            this.current_item.description = Utils.extract(text, rex_description)
            await this.warehouse.update(this.current_item)

            //extend the deadline of closing the publishing session
            this.since_lastest_publishing = Date.now()

        } else {

            //1.give him or her some hints 
            await sender.say(this.getHowToShareInstruction())

            //2.extend the period
            this.since_lastest_publishing = Date.now()
            this.exceed_time_tickers = this.exceed_time_tickers - 1

        }



    }

    this.doConsumeText = async function (sender, contact, text) {

        if (Utils.isRelated(text, reg_ask_for_instruction)) {
            await sender.say(Utils.encodeHTMLEntities(this.getHowToShareInstruction()))
            this.updateSessionState(sender)
            return
        }

        if (Utils.isRelated(text, reg_ask_for_claim)) {
            await sender.say(Utils.encodeHTMLEntities(this.getHowToClaimInstruction()))
            this.updateSessionState(sender)
            return
        }

        //query the database for information 
        if (Utils.isSensitive(text, LIST_KEY_REXES)) {
            this.reporter.showAvailableItems(sender)
            this.updateSessionState(sender)
            return
        }

        if (Utils.isRelated(text, rex_remove_item)) {
            var item_id = Utils.extract(text, rex_remove_item)
            if (item_id == null) {
                await this.sender.say(Utils.encodeHTMLEntities(HINT_REMOVE_COMMAND))
            } else {
                try {
                    await this.warehouse.takeOut(item_id)
                } catch (e) {
                    console.log(e)
                }
            }

            this.updateSessionState(sender)
            return
        }

        //give the contact of the original owner to this guy
        if (Utils.isSensitive(text, AQUIRE_KEY_REXES)) {
            var item_id = Utils.extract(text, rex_partial_of_claim)
            this.reporter.buildBridge(sender, item_id)
            this.updateSessionState(sender)
            return
        }

        if (this.isPublishingInProcess()) {
            //other contact in the group 
            if (!this.areYouPublishing(contact)) {
                if (Utils.isSensitive(text, SHARING_KEY_REXES)) {
                    await sender.say(HINT_THERE_IS_PUBLISHER_NOW)
                }
            } else {

                this.doDirtyWork(text, sender)

            }
            this.updateSessionState(sender)
            return
        }

        this.doInitPublishing(contact)
    }

    this.areYouPublishing = function (contact) {
        return this.current_publisher_name == contact.name()
    }

    this.doConsumeImage = async function (sender, contact, imageFileBox) {
        //we do not care image files except we are at a publishing phase
        if (!this.isPublishingInProcess()) {
            return
        }

        if (!this.areYouPublishing(contact)) {
            return
        }

        var extention = imageFileBox.name.split(".")[1]
        var image_alias = Utils.generateImageName(this.current_item.owner_id,
            Utils.formateDate(Date.now()), extention)

        var image_path = DEFAULT_IMAGE_REPORITORY + "/" + image_alias
        try {
            await imageFileBox.toFile(image_path)
            this.current_item.attachPicture(image_path)

            await this.warehouse.update(this.current_item)
            //extend the deadline of closing the publishing session
            this.since_lastest_publishing = Date.now()

        } catch (e) {
            console.log("fail to save to " + image_path)
            console.log(e)
        }


    }
}

module.exports = Session