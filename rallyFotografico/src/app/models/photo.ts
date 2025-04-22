export interface Photo {
    id?: number;
    usuario_id: number;
    nombre: string;
    estado?: 'pendiente' | 'admitida' | 'rechazada';
    fecha_subida?: string;
    base64: string;
}
