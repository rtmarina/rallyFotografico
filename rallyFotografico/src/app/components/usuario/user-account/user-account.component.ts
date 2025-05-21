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

  constructor(private router: Router, private userService: UserService) {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  }

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    this.usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
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

  subirImagenPerfil(event: any) {
  const archivo = event.target.files[0];
  if (archivo) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.usuario.imagen_perfil = base64;

      this.userService.actualizarFotoPerfil(this.usuario.id, base64).subscribe(res => {
        if (res.success) {
          alert('Foto de perfil actualizada');
          localStorage.setItem('usuario', JSON.stringify(this.usuario));
        } else {
          alert('Error al actualizar la foto: ' + res.error);
        }
      });
    };
    reader.readAsDataURL(archivo);
  }
}

  
  
}
