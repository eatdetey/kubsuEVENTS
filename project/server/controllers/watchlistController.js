const { Watchlist } = require("../models/models")

class WatchlistController{
    async create(req, res) {
        try {
            const {userId} = req.body
            const watchlist = await Watchlist.create({userId})
            return res.json(watchlist)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    
    async getAll(req,res) {
        const watchlist = await Watchlist.findAll()
        return res.json(watchlist)
    }
}

module.exports = new WatchlistController()