"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = require("../config/config");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NewTravel Commerce Plugin API',
            version: '1.0.0',
            description: 'A comprehensive commerce system API documentation',
        },
        servers: [
            {
                url: `http://localhost:${config_1.config.port}`,
                description: 'Development server',
            },
        ],
    },
    apis: [
        './src/api/routes/*.ts',
        './src/api/controllers/*.ts',
        './src/types/*.ts',
    ],
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.swaggerSpec = specs;
const setupSwagger = (app) => {
    // Swagger UI options
    const swaggerOptions = {
        explorer: true,
        customCss: `
      .swagger-ui .topbar { 
        background-color: #2c3e50; 
      }
      .swagger-ui .topbar .download-url-wrapper .select-label select { 
        color: #3b4151; 
      }
      .swagger-ui .info .title { 
        color: #2c3e50; 
      }
      .swagger-ui .scheme-container {
        background: #ffffff;
        box-shadow: 0 1px 2px 0 rgba(0,0,0,.15);
      }
    `,
        customSiteTitle: 'NewTravel Commerce API Documentation',
        customfavIcon: '/assets/favicon.ico',
        swaggerOptions: {
            docExpansion: 'list',
            filter: true,
            showRequestHeaders: true,
            tryItOutEnabled: true,
            requestInterceptor: (req) => {
                // Add authentication headers if available
                // Note: This runs on the client-side in the browser
                return req;
            },
        },
    };
    // Serve Swagger UI
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, swaggerOptions));
    // Serve OpenAPI JSON
    app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
    // Serve ReDoc alternative
    app.get('/redoc', (_req, res) => {
        const redocHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>NewTravel Commerce API - ReDoc</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <redoc spec-url='/api-docs.json' theme='light'></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
      </body>
    </html>
    `;
        res.send(redocHTML);
    });
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map