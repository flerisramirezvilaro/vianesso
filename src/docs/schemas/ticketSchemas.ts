import { TicketStatus } from "../../types/index.js";

export const ticketSchemas = {
  TicketStatus: {
    type: "string",
    enum: Object.values(TicketStatus),
    description: "Estados posibles en el flujo de vida de un ticket.",
    example: TicketStatus.PENDING_REVIEW,
  },

  CompactTicket: {
    type: "object",
    description: "Información resumida de un ticket para listados.",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "d3b07384-d113-49cd-a5d6-80d0051e123d",
      },

      ticket_code: {
        type: "string",
        example: "TICK-2026-0042",
      },

      client_name: {
        type: "string",
        example: "Fleris Ramírez",
      },

      address: {
        type: "string",
        example: "Calle 45 #23-10",
      },

      specific_location: {
        type: "string",
        nullable: true,
        example: "Apto 402, Bloque B",
      },

      access_notes: {
        type: "string",
        nullable: true,
        example: "Tocar el timbre fuerte, portón gris.",
      },

      status: {
        $ref: "#/components/schemas/TicketStatus",
      },

      created_at: {
        type: "string",
        format: "date-time",
        example: "2026-06-26T22:34:44Z",
      },
    },
  },

  TicketDetails: {
    type: "object",
    description: "Detalle completo de un ticket incluyendo técnico asignado.",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },

      ticket_code: {
        type: "string",
        example: "TICK-2026-0042",
      },

      client_name: {
        type: "string",
        example: "Fleris Ramírez",
      },

      address: {
        type: "string",
        example: "Calle 45 #23-10",
      },

      specific_location: {
        type: "string",
        nullable: true,
      },

      access_notes: {
        type: "string",
        nullable: true,
      },

      status: {
        $ref: "#/components/schemas/TicketStatus",
      },

      created_at: {
        type: "string",
        format: "date-time",
      },

      technician_id: {
        type: "string",
        format: "uuid",
        nullable: true,
        example: "440e40c9-d4de-43ac-a84a-b15cfb60c75d",
      },

      technician_name: {
        type: "string",
        nullable: true,
        example: "Marcus Reed",
      },
    },
  },

  TicketUpdateResponse: {
    type: "object",
    description: "Respuesta generada al actualizar un ticket.",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },

      code: {
        type: "string",
        example: "TICK-2026-0042",
      },

      specificLocation: {
        type: "string",
        nullable: true,
      },

      accessNotes: {
        type: "string",
        nullable: true,
      },

      status: {
        $ref: "#/components/schemas/TicketStatus",
      },
    },
  },
};
