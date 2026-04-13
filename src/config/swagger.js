import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Alumni API",
      version: "1.0.0",
      description: "API documentation for Alumni Influencer Platform"
    },
    servers: [
      {
        url: "http://localhost:5000"
      }
    ],

    // 👇 ADD IT RIGHT HERE
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },

  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;