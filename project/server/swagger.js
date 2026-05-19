const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Curse API',
        version: '1.0.0',
        description: 'API documentation for the Curse project backend.'
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Local server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            AuthRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    role: { type: 'string', description: 'Optional role for registration' }
                }
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    token: { type: 'string' }
                }
            },
            UserProfile: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            UpdateProfileBody: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            },
            EventPostCreate: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    userId: { type: 'integer' },
                    description: { type: 'string' },
                    starts: { type: 'string', format: 'date-time' },
                    place: { type: 'string' },
                    status: { type: 'string' },
                    img: { type: 'string', format: 'binary' }
                }
            },
            EventPostUpdate: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    starts: { type: 'string', format: 'date-time' },
                    place: { type: 'string' },
                    status: { type: 'string' }
                }
            },
            EventPost: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    userId: { type: 'integer' },
                    description: { type: 'string' },
                    starts: { type: 'string', format: 'date-time' },
                    place: { type: 'string' },
                    status: { type: 'string' },
                    img: { type: 'string', nullable: true },
                    views: { type: 'integer' }
                }
            },
            NewsPostCreate: {
                type: 'object',
                required: ['title', 'description'],
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' }
                }
            },
            NewsPostUpdate: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' }
                }
            },
            NewsPost: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    likes: { type: 'integer' },
                    userId: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            WatchlistAdd: {
                type: 'object',
                required: ['eventPostId'],
                properties: {
                    eventPostId: { type: 'integer' }
                }
            },
            WatchlistItem: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    userId: { type: 'integer' },
                    eventpostId: { type: 'integer' },
                    EventPost: { $ref: '#/components/schemas/EventPost' }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        }
    },
    paths: {
        '/api/user/registration': {
            post: {
                tags: ['User'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthRequest' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Registration successful',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
                    },
                    400: { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/user/login': {
            post: {
                tags: ['User'],
                summary: 'Login and receive JWT token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthRequest' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
                    },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/user/auth': {
            get: {
                tags: ['User'],
                summary: 'Validate token and refresh it',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Token refreshed', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/user/profile': {
            get: {
                tags: ['User'],
                summary: 'Get profile for authenticated user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Profile retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfile' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            put: {
                tags: ['User'],
                summary: 'Update profile data',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: false,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateProfileBody' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Profile updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfile' } } } },
                    400: { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/eventpost': {
            get: {
                tags: ['EventPost'],
                summary: 'Get all event posts',
                parameters: [
                    {
                        name: 'status',
                        in: 'query',
                        schema: { type: 'string' },
                        description: 'Optional status filter'
                    }
                ],
                responses: {
                    200: { description: 'List of event posts', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/EventPost' } } } } }
                }
            },
            post: {
                tags: ['EventPost'],
                summary: 'Create a new event post',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: { $ref: '#/components/schemas/EventPostCreate' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Event created', content: { 'application/json': { schema: { $ref: '#/components/schemas/EventPost' } } } },
                    400: { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/eventpost/{id}': {
            get: {
                tags: ['EventPost'],
                summary: 'Get event post by id',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Event post details', content: { 'application/json': { schema: { $ref: '#/components/schemas/EventPost' } } } },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            put: {
                tags: ['EventPost'],
                summary: 'Update an event post',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                requestBody: {
                    required: false,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/EventPostUpdate' } }
                    }
                },
                responses: {
                    200: { description: 'Event updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/EventPost' } } } },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/newspost': {
            get: {
                tags: ['NewsPost'],
                summary: 'Get all news posts',
                responses: {
                    200: { description: 'List of news posts', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/NewsPost' } } } } }
                }
            },
            post: {
                tags: ['NewsPost'],
                summary: 'Create a news post',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/NewsPostCreate' } }
                    }
                },
                responses: {
                    200: { description: 'News post created', content: { 'application/json': { schema: { $ref: '#/components/schemas/NewsPost' } } } },
                    400: { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/newspost/{id}': {
            get: {
                tags: ['NewsPost'],
                summary: 'Get news post by id',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'News post details', content: { 'application/json': { schema: { $ref: '#/components/schemas/NewsPost' } } } },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            put: {
                tags: ['NewsPost'],
                summary: 'Update news post',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                requestBody: {
                    required: false,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/NewsPostUpdate' } }
                    }
                },
                responses: {
                    200: { description: 'News post updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/NewsPost' } } } },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            delete: {
                tags: ['NewsPost'],
                summary: 'Delete news post',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'News post deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/newspost/like/{id}': {
            post: {
                tags: ['NewsPost'],
                summary: 'Like a news post',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Like count returned', content: { 'application/json': { schema: { type: 'object', properties: { likes: { type: 'integer' } } } } } },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/watchlist': {
            get: {
                tags: ['Watchlist'],
                summary: 'Get authenticated user watchlist',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Watchlist items', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/WatchlistItem' } } } } }
                }
            },
            post: {
                tags: ['Watchlist'],
                summary: 'Add event to watchlist',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/WatchlistAdd' } }
                    }
                },
                responses: {
                    200: { description: 'Added to watchlist', content: { 'application/json': { schema: { $ref: '#/components/schemas/WatchlistItem' } } } }
                }
            }
        },
        '/api/watchlist/{eventId}': {
            delete: {
                tags: ['Watchlist'],
                summary: 'Remove event from watchlist',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'eventId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Removal result', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } }
                }
            }
        }
    }
};

module.exports = swaggerDocument;
