import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMisfotosComponent } from './user-misfotos.component';

describe('UserMisfotosComponent', () => {
  let component: UserMisfotosComponent;
  let fixture: ComponentFixture<UserMisfotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMisfotosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMisfotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
