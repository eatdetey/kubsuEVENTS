const {NewsPost} = require('../models/models')
const ApiError = require('../error/ApiError')
const path = require('path')
const { stat } = require('fs')

class NewsPostController{
    async create(req, res) {
        try {
        const { title, description } = req.body;
        const news = await NewsPost.create({ title, description });
        return res.json(news);
        } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Ошибка при создании новости' });
        }
    }

    async getAll(req, res) {
        try {
        const news = await NewsPost.findAll();
        return res.json(news);
        } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Ошибка при получении новостей' });
        }
    }

    async getOne(req, res) {
        try {
        const { id } = req.params;
        const news = await NewsPost.findByPk(id); // Альтернатива findOne
        
        if (!news) {
            return res.status(404).json({ message: 'Новость не найдена' });
        }
        
        return res.json(news);
        } catch (e) {
        console.error('Ошибка при получении новости:', e);
        return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new NewsPostController()