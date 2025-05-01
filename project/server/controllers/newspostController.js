const {NewsPost} = require('../models/models')
const ApiError = require('../error/ApiError')
const path = require('path')
const { stat } = require('fs')

class NewsPostController{
    async create(req, res, next) {
        try {
            const {userId, title, description, likes} = req.body
            const newspost = await NewsPost.create({userId, title, description, likes})
            return res.json(newspost)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        const newsposts = await NewsPost.findAll()
        return res.json(newsposts)
    }
    
    async getOne(req, res) {
        const {id} = req.params
        const eventpost = await EventPost.findOne({where: {id}})
        return res.json(eventpost)
    }
}

module.exports = new NewsPostController()