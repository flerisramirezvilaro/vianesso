import { commonErrors, successResponse } from "../utils/swaggerHelpers.js";

export const authPaths = {
  "/auth/login": {
    post: {
      summary: "Iniciar Sesión (Login)",
      tags: ["Autenticación"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "user@vianesso.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "securePassword123",
                },
              },
            },
          },
        },
      },
      responses: {
        200: successResponse(
          "Autenticación exitosa. Devuelve el token JWT de sesión.",
          {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },

            user: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                  example: "7e5287ac-e94a-4722-baa1-24b40206f551",
                },

                name: {
                  type: "string",
                  example: "Carlos Técnico",
                },

                email: {
                  type: "string",
                  format: "email",
                  example: "user@vianesso.com",
                },

                phone: {
                  type: "string",
                  nullable: true,
                  example: "+573001234567",
                },

                role: {
                  type: "string",
                  example: "technician",
                },

                avatarUrl: {
                  type: "string",
                  nullable: true,
                  example:
                    "https://res.cloudinary.com/xombrsnn/image/upload/v1789770378/vianesso_uploads/avatar.png",
                },
              },
            },
          },
        ),
        400: commonErrors.badRequest,
        401: commonErrors.unauthorized,
      },
    },
  },
  "/auth/register": {
    post: {
      summary: "Registrar un nuevo usuario (Cliente)",
      tags: ["Autenticación"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password", "name", "role"],
              properties: {
                name: { type: "string", example: "Fleris Ramírez" },
                email: {
                  type: "string",
                  format: "email",
                  example: "user@vianesso.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "securePassword123",
                },
                role: {
                  type: "string",
                  example: "client",
                },
              },
            },
          },
        },
      },
      responses: {
        201: successResponse("Usuario registrado con éxito.", {
          message: {
            type: "string",
            example: "User registered successfully. ",
          },
          user: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
                example: "u1b07384-d113-49cd-a5d6-80d0051e123d",
              },
              name: { type: "string", example: "Fleris Ramírez" },
              email: { type: "string", example: "user@vianesso.com" },
              role: { type: "string", example: "client" },
            },
          },
        }),
        400: commonErrors.badRequest,
        409: commonErrors.conflict,
      },
    },
  },
};
