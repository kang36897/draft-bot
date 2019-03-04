class IdelItem {

    constructor(ownerId, ownerName) {
        this._id = -1
        this.owner_id = ownerId
        this.owner_name = ownerName
        this.name = ""
        this.description = ""
        this.photos = []
        this.remaining_amount = 0
    }

    showSelf() {
        return `物品: "${this.name}"\
        编号: "${this._id}"\
        物主: "${this.owner_name}"\
        物品描述: "${this.description}"\
        数量:"${this.remaining_amount}"`
    }

    describeSelf() {
        return `物品: "${this.name}"\n编号: "${this._id}"\n物主: "${this.owner_name}"\n物品描述: "${this.description}"\n`
    }

    getPhotoListsInString() {
        if (this.photos.length == 0) {
            return ""
        }

        return this.photos.join(',')
    }

    hasPhotos() {
        if (this.photos.length == 0) {
            return false
        }

        for (var i = 0; i < this.photos.length; i++) {
            if (this.isValid(this.photos[i])) {
                return true
            }
        }

        return false
    }


    isValid(path) {
        return (path != null) && (path.trim() != "")
    }

    attachPicture(image_path) {
        if (this.isValid(image_path)) {
            this.photos.push(image_path)
        }
    }
}


module.exports = IdelItem