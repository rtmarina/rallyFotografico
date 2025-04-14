import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'rallyFotografico';

  esAdmin(): boolean {
    const datos = localStorage.getItem('usuario');
    const usuario = datos ? JSON.parse(datos) : null;
    return usuario?.rol === 'admin';
  }
  
}
