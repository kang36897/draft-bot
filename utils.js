const dateFormat = require('dateformat');

class Utils {

    static decodeHTMLEntities(text) {
        var entities = [
            ['amp', '&'],
            ['apos', '\''],
            ['#x27', '\''],
            ['#x2F', '/'],
            ['#39', '\''],
            ['#47', '/'],
            ['lt', '<'],
            ['gt', '>'],
            ['nbsp', ' '],
            ['quot', '"']
        ];

        for (var i = 0, max = entities.length; i < max; ++i)
            text = text.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);

        return text;
    }

    static encodeHTMLEntities(text) {
        var entities = [
            ['lt', '<'],
            ['gt', '>'],
        ];

        for (var i = 0, max = entities.length; i < max; ++i)
            text = text.replace(new RegExp(entities[i][1], 'g'), '&' + entities[i][0] + ';');

        return text
    }

    static isRelated(text, reg) {
        return new RegExp(reg, 'g').test(Utils.decodeHTMLEntities(text))
    }

    static isSensitive(text, rexes) {
        for (var i = 0; i < rexes.length; i++) {

            if (Utils.isRelated(text, rexes[i])) {
                return true
            }
        }

        return false
    }


    static extract(text, reg) {
        var result = new RegExp(reg, 'g').exec(Utils.decodeHTMLEntities(text))
        if (result !== null) {
            return result[1]
        } else {
            return null
        }
    }


    static generateImageName(owner_id, timestamp, extention) {
        return [owner_id, timestamp].join("_") + "." + extention
    }

    static formateDate(datetime) {
        const formateString = "yyyymmddHHMMss"
        return dateFormat(Date.now(), formateString)
    }
}

module.exports = Utils
