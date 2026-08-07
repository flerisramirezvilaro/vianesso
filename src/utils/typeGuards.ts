
import { Response } from 'express';
import { JsType } from '../types/infrastructure.types.js'; 

/**
 * Verifica de manera estricta si un objeto cumple con la interfaz mínima de una Response de Express.
 */
export const isValidExpressResponse = (res: unknown): res is Response => {
  
    if (!res || typeof res !== JsType.OBJECT) {
        return false;
    }
    
   
    const potentialRes = res as Record<string, unknown>;
    return typeof potentialRes.status === JsType.FUNCTION;
};

/**
 * Garantiza que el parámetro de Express sea un string único y limpio.
 * Si es un array, toma el primer elemento. Si es undefined, retorna un string vacío.
 */
export const ensureSingleString = (value: unknown): string => {
    if (typeof value === 'string') {
        return value.trim();
    }
    if (Array.isArray(value)) {
        const first = value[0];
        return typeof first === 'string' ? first.trim() : '';
    }
    return '';
};