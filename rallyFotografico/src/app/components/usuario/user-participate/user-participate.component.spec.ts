import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserParticipateComponent } from './user-participate.component';

describe('UserParticipateComponent', () => {
  let component: UserParticipateComponent;
  let fixture: ComponentFixture<UserParticipateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserParticipateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserParticipateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
