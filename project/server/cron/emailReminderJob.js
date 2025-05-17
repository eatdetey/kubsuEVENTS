const cron = require('node-cron');
const { Watchlist, EventPost, User } = require('../models/models');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');

const scheduleEmailReminders = () => {
    cron.schedule('0 * * * *', async () => {
        const now = new Date();
        const targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); 

        const windowStart = new Date(targetTime.getTime() - 15 * 60 * 1000);
        const windowEnd = new Date(targetTime.getTime() + 15 * 60 * 1000);

        try {
            const upcomingEvents = await EventPost.findAll({
                where: {
                    starts: {
                        [Op.between]: [windowStart.toISOString(), windowEnd.toISOString()]
                    }
                },
                include: [{
                    model: Watchlist,
                    include: [User]
                }]
            });

            for (const event of upcomingEvents) {
                for (const watch of event.Watchlists) {
                    const user = watch.User;
                    if (user?.email) {
                        const subject = `Напоминание о событии "${event.title}"`;
                        const message = `Здравствуйте! Напоминаем, что мероприятие "${event.title}" начнется через 24 часа.\n\n📍 Место: ${event.place || 'не указано'}\n🕒 Время: ${new Date(event.starts).toLocaleString()}`;
                        await sendEmail(user.email, subject, message);
                        console.log(`Письмо отправлено: ${user.email}`);
                    }
                }
            }
        } catch (err) {
            console.error('Ошибка при отправке email-напоминаний:', err);
        }
    });

    console.log('Email-напоминания запущены');
};

module.exports = scheduleEmailReminders;
