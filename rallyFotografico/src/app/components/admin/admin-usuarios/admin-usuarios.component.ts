import { Component, OnInit } from '@angular/core';
import { Usuarios } from '../../../models/usuarios';
import { AdminServiceService } from '../../../services/admin-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-usuarios',
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent implements OnInit{
  usuarios: Usuarios[] = [];
  nuevoUsuario: Usuarios = { nombre: '', email: '', password: '', rol: ''};
  editando: boolean = false;
  errorEmail: string = '';

  constructor(private servicio: AdminServiceService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.servicio.listarUsers().subscribe(data => {
      this.usuarios = data;
    });
  }

  crearUsuario() {
    this.errorEmail = ''; 

    this.servicio.insertarUser(this.nuevoUsuario).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.nuevoUsuario = { nombre: '', email: '', password: '', rol: '' };
      },
      error: (err) => {
        if (err.status === 409) { 
          this.errorEmail = 'Este correo ya está registrado.';
        } else {
          console.error('Error al crear usuario:', err);
        }
      }
    });
  }

  actualizarUsuario(usuario: Usuarios) {
  this.errorEmail = ''; // Limpia errores anteriores

  this.servicio.actualizarUser(this.nuevoUsuario).subscribe({
    next: (res: any) => {
      if (res.success) {
        this.cargarUsuarios();
        this.nuevoUsuario = { nombre: '', email: '', password: '', rol: '' };
        this.editando = false;
      } else {
        this.errorEmail = res.error || 'Error desconocido al actualizar';
      }
    },
    error: (err) => {
      console.error('Error HTTP al actualizar usuario:', err);
      this.errorEmail = 'Error de conexión con el servidor';
    }
  });
}

  

  eliminarUsuario(id: number) {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      this.servicio.eliminarUser(id).subscribe(() => {
        this.cargarUsuarios();
      });
    }
  }

  editar(usuario: Usuarios) {
    this.nuevoUsuario = { ...usuario };
    this.editando = true;
  }

  cancelarEdicion() {
    this.nuevoUsuario = { nombre: '', email: '', password: '', rol: '' };
    this.editando = false;
  }
}
