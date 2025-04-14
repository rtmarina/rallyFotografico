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

  usuario: any = null;

  constructor() {
    const datos = localStorage.getItem('usuario');
    this.usuario = datos ? JSON.parse(datos) : null;
  }
  
  esAdmin(): boolean {
    return this.usuario?.rol === 'admin';
  }
  
}
