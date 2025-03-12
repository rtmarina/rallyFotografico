import { Routes } from '@angular/router';
import { UserMenuComponent } from './components/usuario/user-menu/user-menu.component';
import { UserInfoComponent } from './components/usuario/user-info/user-info.component';
import { UserGalleryComponent } from './components/usuario/user-gallery/user-gallery.component';

export const routes: Routes = [
    {
        path: 'home', component: UserMenuComponent
    },
    {
        path: 'informacion', component: UserInfoComponent
    },
    {
        path: 'gallery', component: UserGalleryComponent
    }
];
