// src/utils/generators.ts

/**
 * Genera un código de ticket único con el formato VN-XXXX (4 dígitos aleatorios).
 */
export const generateTicketCode = (): string => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `VN-${randomNum}`;
};