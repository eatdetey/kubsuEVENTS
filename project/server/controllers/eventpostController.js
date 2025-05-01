const {EventPost} = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path')
const { stat } = require('fs')

class EventPostController{
    async create(req, res, next) {
        try {
            const {title, userId, description, start_time, place, status} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname,'..', 'static', fileName))

            const eventpost = await EventPost.create({title, userId, description, start_time, place, status, img:fileName})
            return res.json(eventpost)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        const {status} = req.query
        let eventposts
        if (!status) {
            eventposts = await EventPost.findAll()
        }
        else {
            eventposts = await EventPost.findAll({where:{status}})
        }
        return res.json(eventposts)
    }

    async getOne(req, res) {
        const {id} = req.params
        const eventpost = await EventPost.findOne({where: {id}})
        return res.json(eventpost)
    }
}

module.exports = new EventPostController()