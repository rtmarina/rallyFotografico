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
  nuevoUsuario: Usuarios = { nombre: '', email: '', password: '' };
  editando: boolean = false;

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
    this.servicio.insertarUser(this.nuevoUsuario).subscribe(() => {
      this.cargarUsuarios();
      this.nuevoUsuario = { nombre: '', email: '', password: '' };
    });
  }

  actualizarUsuario(usuario: Usuarios) {
    this.servicio.actualizarUser(this.nuevoUsuario).subscribe(() => {
      this.cargarUsuarios();
      this.nuevoUsuario = { nombre: '', email: '', password: '' };
      this.editando = false;
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
    this.nuevoUsuario = { nombre: '', email: '', password: '' };
    this.editando = false;
  }
}
