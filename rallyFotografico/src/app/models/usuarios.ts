export interface Usuarios {
    id?: number;
    nombre: string;
    email: string;
    password: string;
    rol: string;
    fotosSubidas?: number;
    totalVotos?: number;
}
