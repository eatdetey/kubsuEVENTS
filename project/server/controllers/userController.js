const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');
const { ROLES } = require('../constants/roles');

const PROFILE_ATTRS = ['id', 'email', 'username', 'role', 'createdAt'];

const generateJwt = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
};

class UserController {
    async registration(req, res, next) {
        try {
            const { email, password, username } = req.body;
            // `role` is intentionally NOT read from the body. The public
            // registration endpoint creates only regular USER accounts;
            // promoting a user is an admin-only operation (separate endpoint).
            if (!email || !password) {
                return next(ApiError.badRequest('Некорректный email или пароль'));
            }

            const candidate = await User.findOne({ where: { email } });
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'));
            }

            let finalUsername;
            if (username !== undefined && username !== null) {
                if (typeof username !== 'string' || username.trim().length === 0) {
                    return next(ApiError.badRequest('username must be a non-empty string'));
                }
                finalUsername = username.trim();
            } else {
                // Fall back to the email local-part — same convention as the
                // backfill in 20260521120001-add-username-to-users.
                finalUsername = String(email).split('@')[0];
            }

            const hashPassword = await bcrypt.hash(password, 5);
            const user = await User.create({
                email,
                password: hashPassword,
                username: finalUsername,
                role: ROLES.USER,
            });
            const token = generateJwt(user.id, user.email, user.role);

            return res.json({ token });
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            
            if (!user) {
                return next(ApiError.internal('Пользователь не найден'));
            }
            
            let comparePassword = bcrypt.compareSync(password, user.password);
            if (!comparePassword) {
                return next(ApiError.internal('Неверный пароль'));
            }
            
            const token = generateJwt(user.id, user.email, user.role);
            return res.json({ token });
        } catch (e) {
            next(ApiError.internal(e.message));
        }
    }

    async check(req, res, next) {
        try {
            const token = generateJwt(req.user.id, req.user.email, req.user.role);
            return res.json({ token });
        } catch (e) {
            next(ApiError.internal(e.message));
        }
    }

    async getProfile(req, res, next) {
        try {
            const { id } = req.user;
            const user = await User.findOne({
                where: { id },
                attributes: PROFILE_ATTRS
            });

            return res.json(user);
        } catch (e) {
            next(ApiError.internal('Ошибка при получении профиля'));
        }
    }

    async updateProfile(req, res, next) {
        try {
            const { id } = req.user;
            const { email, username } = req.body;

            // Whitelist of fields the user can edit on their own profile.
            // `role` and `password` are intentionally excluded — role changes
            // are admin-only, password changes belong to a dedicated endpoint.
            const patch = {};

            if (email !== undefined) {
                const candidate = await User.findOne({ where: { email } });
                if (candidate && candidate.id !== id) {
                    return next(ApiError.badRequest('Email уже используется'));
                }
                patch.email = email;
            }

            if (username !== undefined) {
                if (username !== null && (typeof username !== 'string' || username.trim().length === 0)) {
                    return next(ApiError.badRequest('username must be a non-empty string'));
                }
                patch.username = username === null ? null : username.trim();
            }

            if (Object.keys(patch).length > 0) {
                await User.update(patch, { where: { id } });
            }
            const user = await User.findByPk(id, {
                attributes: PROFILE_ATTRS
            });

            return res.json(user);
        } catch (e) {
            next(ApiError.internal('Ошибка при обновлении профиля'));
        }
    }
}

module.exports = new UserController();