import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactInterest } from './contact-interest';

describe('ContactInterest', () => {
  let component: ContactInterest;
  let fixture: ComponentFixture<ContactInterest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactInterest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactInterest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
