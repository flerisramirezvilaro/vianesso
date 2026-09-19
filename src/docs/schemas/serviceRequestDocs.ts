export const serviceRequestSchemas = {
  ServiceRequest: {
    type: "object",
    description:
      "Estructura de la información de una solicitud de servicio expuesta al Frontend.",
    properties: {
      id: {
        type: "string",
        example: "#VN-440e",
        description: "Identificador corto visible para el usuario.",
      },

      request_id: {
        type: "string",
        format: "uuid",
        example: "440e40c9-d4de-43ac-a84a-b15cfb60c75d",
      },

      client_id: {
        type: "string",
        format: "uuid",
        example: "c9a29e24-f11c-4233-a4e2-1a2b3c4d5e6f",
      },

      title: {
        type: "string",
        example: "Reparación de tubería principal",
      },

      category: {
        type: "string",
        example: "Plomería",
      },

      description: {
        type: "string",
        example:
          "Se presenta una fuga masiva de agua potable en el contador principal.",
      },

      address: {
        type: "string",
        nullable: true,
        example: "Calle 72 # 46-23, Barrio El Prado",
      },

      status: {
        type: "string",
        example: "pending_review",
      },

      technician_name: {
        type: "string",
        nullable: true,
        example: "Marcus Reed",
      },

      evidence_urls: {
        type: "array",
        items: {
          type: "string",
          format: "uri",
        },
        example: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      },

      created_at: {
        type: "string",
        format: "date-time",
        example: "2026-06-29T04:04:59.715Z",
      },
    },
  },

  ClientMetrics: {
    type: "object",
    description: "Métricas agregadas para el dashboard general del cliente.",
    properties: {
      active_services: {
        type: "integer",
        example: 2,
      },

      completed_tasks: {
        type: "integer",
        example: 14,
      },

      pending_reviews: {
        type: "integer",
        example: 1,
      },
    },
  },

  RequestMetrics: {
    type: "object",
    description: "Métricas específicas de las solicitudes del cliente.",
    properties: {
      pending_review: {
        type: "integer",
        example: 1,
      },

      active: {
        type: "integer",
        example: 2,
      },

      history: {
        type: "integer",
        example: 15,
      },
    },
  },
};
