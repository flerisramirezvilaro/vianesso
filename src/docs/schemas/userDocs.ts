export const userSchemas = {
  UserProfile: {
    type: "object",
    description: "Información pública del usuario autenticado.",
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
        example: "fleris@gmail.com",
      },
      phone: {
        type: "string",
        nullable: true,
        example: "+573004567890",
      },
      role: {
        type: "string",
        example: "technician",
      },
      avatar_url: {
        type: "string",
        nullable: true,
        example: "https://res.cloudinary.com/.../avatar.png",
      },
    },
  },
};
