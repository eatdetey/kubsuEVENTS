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
                    username: { type: 'string', description: 'Optional display name; falls back to the email local-part' }
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
                    username: { type: 'string', nullable: true },
                    role: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            UpdateProfileBody: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    username: { type: 'string', nullable: true }
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
                    img: { type: 'string', format: 'binary' },
                    latitude: { type: 'number', format: 'double', minimum: -90, maximum: 90, nullable: true },
                    longitude: { type: 'number', format: 'double', minimum: -180, maximum: 180, nullable: true },
                    registration_required: { type: 'boolean' },
                    max_participants: { type: 'integer', minimum: 1, nullable: true,
                        description: 'Honoured only when registration_required is true; otherwise ignored.' }
                }
            },
            EventPostUpdate: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    starts: { type: 'string', format: 'date-time' },
                    place: { type: 'string' },
                    status: { type: 'string' },
                    latitude: { type: 'number', format: 'double', minimum: -90, maximum: 90, nullable: true },
                    longitude: { type: 'number', format: 'double', minimum: -180, maximum: 180, nullable: true },
                    registration_required: { type: 'boolean' },
                    max_participants: { type: 'integer', minimum: 1, nullable: true }
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
                    views: { type: 'integer' },
                    latitude: { type: 'string', nullable: true,
                        description: 'DECIMAL returned as string by pg.' },
                    longitude: { type: 'string', nullable: true },
                    registration_required: { type: 'boolean' },
                    max_participants: { type: 'integer', nullable: true }
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
            },

            // --- Stage 3 schemas -------------------------------------------

            Author: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    username: { type: 'string', nullable: true }
                }
            },
            Pagination: {
                type: 'object',
                properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' }
                }
            },
            LikeMutationResponse: {
                type: 'object',
                properties: {
                    liked: { type: 'boolean' },
                    likesCount: { type: 'integer' }
                }
            },
            LikesCountResponse: {
                type: 'object',
                properties: {
                    likesCount: { type: 'integer' },
                    liked: { type: 'boolean', nullable: true,
                        description: 'For an authenticated caller: whether they liked the post. For an anonymous caller: null.' }
                }
            },
            Comment: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    content: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    author: { $ref: '#/components/schemas/Author' }
                }
            },
            CommentCreate: {
                type: 'object',
                required: ['content'],
                properties: {
                    content: { type: 'string', minLength: 1, maxLength: 2000 }
                }
            },
            CommentsList: {
                type: 'object',
                properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                }
            },
            Category: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    slug: { type: 'string', pattern: '^[a-z0-9-]+$' }
                }
            },
            CategoryCreate: {
                type: 'object',
                required: ['name', 'slug'],
                properties: {
                    name: { type: 'string' },
                    slug: { type: 'string', pattern: '^[a-z0-9-]+$' }
                }
            },
            CategoryUpdate: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    slug: { type: 'string', pattern: '^[a-z0-9-]+$' }
                }
            },
            UserPreferencesUpdate: {
                type: 'object',
                required: ['categoryIds'],
                properties: {
                    categoryIds: { type: 'array', items: { type: 'integer' } }
                }
            },
            RegisterResponse: {
                type: 'object',
                properties: {
                    ticketUuid: { type: 'string', format: 'uuid' },
                    eventId: { type: 'integer' },
                    registeredAt: { type: 'string', format: 'date-time' }
                }
            },
            EventTicket: {
                type: 'object',
                properties: {
                    ticketUuid: { type: 'string', format: 'uuid' },
                    eventId: { type: 'integer' },
                    registeredAt: { type: 'string', format: 'date-time', nullable: true },
                    isAttended: { type: 'boolean' },
                    event: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', nullable: true },
                            date: { type: 'string', format: 'date-time', nullable: true }
                        }
                    }
                }
            },
            CheckInBody: {
                type: 'object',
                required: ['ticketUuid'],
                properties: {
                    ticketUuid: { type: 'string', format: 'uuid' }
                }
            },
            CheckInResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    attendee: {
                        type: 'object',
                        properties: {
                            userId: { type: 'integer' },
                            username: { type: 'string', nullable: true }
                        }
                    },
                    event: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            title: { type: 'string', nullable: true }
                        }
                    }
                }
            },
            Registration: {
                type: 'object',
                properties: {
                    userId: { type: 'integer' },
                    username: { type: 'string', nullable: true },
                    registeredAt: { type: 'string', format: 'date-time', nullable: true },
                    isAttended: { type: 'boolean' },
                    ticketUuid: { type: 'string', format: 'uuid' }
                }
            },
            RegistrationsList: {
                type: 'object',
                properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Registration' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                    stats: {
                        type: 'object',
                        properties: {
                            total: { type: 'integer' },
                            attended: { type: 'integer' },
                            pending: { type: 'integer' }
                        }
                    }
                }
            },
            RoleUpdateBody: {
                type: 'object',
                required: ['role'],
                properties: {
                    role: {
                        type: 'string',
                        enum: ['USER', 'SECURITY', 'EDITOR', 'MOD', 'ADMIN']
                    }
                }
            },
            UserPublic: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    email: { type: 'string', format: 'email' },
                    username: { type: 'string', nullable: true },
                    role: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' }
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
        },

        // ============================================================
        // Stage 3 endpoints
        // ============================================================

        '/api/news/{newsPostId}/like': {
            post: {
                tags: ['Likes'],
                summary: 'Like a news post',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'newsPostId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    201: { description: 'Liked', content: { 'application/json': { schema: { $ref: '#/components/schemas/LikeMutationResponse' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'News post not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Already liked', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            delete: {
                tags: ['Likes'],
                summary: 'Remove own like from a news post',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'newsPostId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Unliked', content: { 'application/json': { schema: { $ref: '#/components/schemas/LikeMutationResponse' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Like not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/news/{newsPostId}/likes/count': {
            get: {
                tags: ['Likes'],
                summary: 'Get like count and whether the caller liked it',
                description: 'Public endpoint. If a valid Bearer token is sent, "liked" reflects the caller; otherwise it is null.',
                parameters: [
                    { name: 'newsPostId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Count payload', content: { 'application/json': { schema: { $ref: '#/components/schemas/LikesCountResponse' } } } },
                    404: { description: 'News post not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },

        '/api/news/{newsPostId}/comments': {
            get: {
                tags: ['Comments'],
                summary: 'List comments on a news post (newest first, paginated)',
                parameters: [
                    { name: 'newsPostId', in: 'path', required: true, schema: { type: 'integer' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }
                ],
                responses: {
                    200: { description: 'Comments page', content: { 'application/json': { schema: { $ref: '#/components/schemas/CommentsList' } } } },
                    404: { description: 'News post not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            post: {
                tags: ['Comments'],
                summary: 'Create a comment',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'newsPostId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/CommentCreate' } } }
                },
                responses: {
                    201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Comment' } } } },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'News post not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/news/{newsPostId}/comments/{commentId}': {
            delete: {
                tags: ['Comments'],
                summary: 'Delete a comment (owner OR MOD/ADMIN)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'newsPostId', in: 'path', required: true, schema: { type: 'integer' } },
                    { name: 'commentId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { deleted: { type: 'boolean' } } } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Comment not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },

        '/api/categories': {
            get: {
                tags: ['Categories'],
                summary: 'List categories',
                parameters: [
                    { name: 'type', in: 'query', schema: { type: 'string', enum: ['news', 'event', 'all'], default: 'all' },
                      description: 'Reserved for future use; currently all categories are shared.' }
                ],
                responses: {
                    200: { description: 'List', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } }
                }
            },
            post: {
                tags: ['Categories'],
                summary: 'Create category (MOD or ADMIN)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryCreate' } } }
                },
                responses: {
                    201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Name or slug already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/categories/{id}': {
            put: {
                tags: ['Categories'],
                summary: 'Update category (MOD or ADMIN)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryUpdate' } } }
                },
                responses: {
                    200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Name or slug already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            delete: {
                tags: ['Categories'],
                summary: 'Delete category (ADMIN only)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { deleted: { type: 'boolean' } } } } } },
                    403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Category is in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },

        '/api/users/me/preferences': {
            get: {
                tags: ['Preferences'],
                summary: 'Get current user category preferences',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'List', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            put: {
                tags: ['Preferences'],
                summary: 'Replace current user category preferences',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPreferencesUpdate' } } }
                },
                responses: {
                    200: { description: 'Updated list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } },
                    400: { description: 'Invalid categoryIds', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },

        '/api/events/{eventId}/register': {
            post: {
                tags: ['Registrations'],
                summary: 'Register the current user for an event',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'eventId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    201: { description: 'Registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } } },
                    400: { description: 'Registration not required', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Already registered OR event is full', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            delete: {
                tags: ['Registrations'],
                summary: 'Cancel own registration (blocked after check-in)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'eventId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Cancelled', content: { 'application/json': { schema: { type: 'object', properties: { cancelled: { type: 'boolean' } } } } } },
                    400: { description: 'Cannot cancel after check-in', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Registration not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/events/{eventId}/ticket': {
            get: {
                tags: ['Registrations'],
                summary: "Get the caller's ticket for an event",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'eventId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Ticket', content: { 'application/json': { schema: { $ref: '#/components/schemas/EventTicket' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Ticket not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/events/check-in': {
            post: {
                tags: ['Registrations'],
                summary: 'Check in a ticket (SECURITY / MOD / ADMIN)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckInBody' } } }
                },
                responses: {
                    200: { description: 'Checked in', content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckInResponse' } } } },
                    400: { description: 'Invalid ticketUuid', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Ticket not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Ticket already used', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/events/{eventId}/registrations': {
            get: {
                tags: ['Registrations'],
                summary: 'List registrations for an event (MOD / ADMIN)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'eventId', in: 'path', required: true, schema: { type: 'integer' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }
                ],
                responses: {
                    200: { description: 'Page with stats', content: { 'application/json': { schema: { $ref: '#/components/schemas/RegistrationsList' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },

        '/api/users': {
            get: {
                tags: ['Admin'],
                summary: 'List all users (ADMIN only)',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'List of users', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/UserPublic' } } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/users/{userId}/role': {
            patch: {
                tags: ['Admin'],
                summary: "Change another user's role (ADMIN only)",
                description: 'Admin cannot change their own role.',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/RoleUpdateBody' } } }
                },
                responses: {
                    200: { description: 'Role updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPublic' } } } },
                    400: { description: 'Validation error or self-change attempt', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        }
    }
};

module.exports = swaggerDocument;
