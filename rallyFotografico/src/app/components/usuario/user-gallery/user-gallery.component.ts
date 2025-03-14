import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-user-gallery',
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './user-gallery.component.html',
  styleUrl: './user-gallery.component.css',
  standalone: true
})
export class UserGalleryComponent {
  photos = [
    { id: 1, url: 'join-bg.jpg', likes: 10 },
    { id: 2, url: 'join-bg.jpg', likes: 5 },
    { id: 3, url: 'join-bg.jpg', likes: 8 },
    { id: 4, url: 'join-bg.jpg', likes: 12 },
    { id: 5, url: 'join-bg.jpg', likes: 7 },
    { id: 6, url: 'join-bg.jpg', likes: 4 },
    { id: 7, url: 'join-bg.jpg', likes: 15 },
    { id: 8, url: 'join-bg.jpg', likes: 2 },
    { id: 9, url: 'join-bg.jpg', likes: 9 },
    { id: 10, url: 'join-bg.jpg', likes: 6 },
    { id: 11, url: 'join-bg.jpg', likes: 11 },
    { id: 12, url: 'join-bg.jpg', likes: 3 },
    { id: 13, url: 'join-bg.jpg', likes: 13 },
    { id: 14, url: 'join-bg.jpg', likes: 1 },
    { id: 15, url: 'join-bg.jpg', likes: 14 },
    { id: 16, url: 'join-bg.jpg', likes: 7 },
    { id: 17, url: 'join-bg.jpg', likes: 10 },
    { id: 18, url: 'join-bg.jpg', likes: 5 },
  ];

  currentPage = 1;

  likePhoto(photoId: number) {
    const photo = this.photos.find(p => p.id === photoId);
    if (photo) {
      photo.likes++;
    }
  }
}
