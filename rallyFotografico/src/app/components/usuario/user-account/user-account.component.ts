import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css'],
  providers: [UserService]
})
export class UserAccountComponent implements OnInit {
usuario: any = null;
  editar: boolean = false;
  mostrarFormularioPassword: boolean = false;
  nuevaPassword: string = '';
  confirmarPassword: string = '';

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.cargarUsuario();
  }

 cargarUsuario() {
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (usuarioLocal && usuarioLocal.id) {
    const id = usuarioLocal.id;

    this.userService.getUsuario(id).subscribe({
      next: (usuarioActualizado) => {
        this.usuario = usuarioActualizado;
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
      },
      error: (err) => {
        console.error('Error al cargar usuario:', err);
      }
    });
  } else {
    console.warn('No se encontró un usuario válido en localStorage');
  }
}


  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  guardarCambios() {
    const datosActualizados = {
      id: this.usuario.id,
      nombre: this.usuario.nombre,
      email: this.usuario.email
    };

    this.userService.actualizarUsuario(datosActualizados).subscribe(res => {
      if (res.success) {
        alert('Datos actualizados correctamente');
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.editar = false;
      } else {
        alert('Error al actualizar: ' + res.error);
      }
    });
  }

  cambiarContrasena() {
    if (!this.nuevaPassword || !this.confirmarPassword) {
      alert("Debes rellenar ambos campos.");
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    this.usuario.password = this.nuevaPassword;
    this.userService.actualizarUsuario(this.usuario).subscribe(res => {
      if (res.success) {
        alert("Contraseña actualizada correctamente.");
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.mostrarFormularioPassword = false;
        this.nuevaPassword = '';
        this.confirmarPassword = '';
      } else {
        alert("Error al actualizar: " + res.error);
      }
    });
  }

  eliminarCuenta() {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");

    if (confirmar) {
      this.userService.eliminarUsuario(this.usuario.id).subscribe(res => {
        if (res.success) {
          alert("Cuenta eliminada correctamente.");
          localStorage.removeItem('usuario');
          this.router.navigate(['/login']);
        } else {
          alert("Error al eliminar la cuenta: " + res.error);
        }
      });
    }
  }

  subirFotoPerfil(event: any) {
    const archivo = event.target.files[0];

    const lector = new FileReader();
    lector.onload = () => {
      const base64 = (lector.result as string).split(',')[1]; // solo la parte base64
      const usuario_id = this.usuario.id;

      this.userService.actualizarFotoPerfil(usuario_id, base64).subscribe({
        next: res => {
          if (res.success) {
            alert('Foto actualizada correctamente');
            this.cargarUsuario(); 
          } else {
            console.error('Error en el backend:', res.error);
          }
        },
        error: err => console.error('Error HTTP:', err)
      });
    };

    lector.readAsDataURL(archivo);
  }

}


