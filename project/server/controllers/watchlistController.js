const { Watchlist, EventPost, User } = require('../models/models');
const sendEmail = require('../utils/sendEmail');

class WatchlistController {
    async addToWatchlist(req, res) {
        try {
            const userId = req.user.id;
            const { eventPostId } = req.body;

            const item = await Watchlist.create({ userId, eventpostId: eventPostId });

            // Получаем данные события и пользователя
            const event = await EventPost.findByPk(eventPostId);
            const user = await User.findByPk(userId);

            if (event && user?.email) {
                const subject = 'Вы добавили событие в избранное';
                const message = `Вы добавили в избранное событие: ${event.title}\n\nДата начала: ${new Date(event.starts).toLocaleString()}\nМесто: ${event.place || 'не указано'}`;

                await sendEmail(user.email, subject, message);
            }

            return res.json(item);
        } catch (error) {
            console.error('Ошибка при добавлении в избранное:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async removeFromWatchlist(req, res) {
        const userId = req.user.id;
        const { eventId } = req.params;

        const deleted = await Watchlist.destroy({ where: { userId, eventpostId: eventId } });
        return res.json({ success: !!deleted });
    }

    async getMyWatchlist(req, res) {
        const userId = req.user.id;

        const favorites = await Watchlist.findAll({
            where: { userId },
            include: [{ model: EventPost }]
        });

        return res.json(favorites);
    }
}

module.exports = new WatchlistController();
