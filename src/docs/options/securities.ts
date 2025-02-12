export default {
    "api-key": {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "API Key for the API",
    },
    "bearer-auth": {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Authorization header using the Bearer scheme",
    },

    /* implement your own security scheme for Swagger Docs */
};