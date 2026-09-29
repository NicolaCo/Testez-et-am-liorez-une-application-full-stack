import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of } from 'rxjs';

import { SessionService } from './core/service/session.service';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let sessionServiceMock: { $isLogged: jest.Mock; logOut: jest.Mock };

  beforeEach(async () => {
    sessionServiceMock = {
      $isLogged: jest.fn(),
      logOut: jest.fn()
    };

    sessionServiceMock.$isLogged.mockReturnValue(of(false));

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
        MatToolbarModule
      ],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('$isLogged()', () => {
    it('should delegate to sessionService.$isLogged()', () => {
      sessionServiceMock.$isLogged.mockReturnValue(of(true));

      let received: boolean | undefined;
      component.$isLogged().subscribe((value) => received = value);

      expect(sessionServiceMock.$isLogged).toHaveBeenCalled();
      expect(received).toBe(true);
    });
  });

  describe('logout()', () => {
    it('should log the user out and navigate to the home page', () => {
      const navigateSpy = jest
        .spyOn(TestBed.inject(Router), 'navigate')
        .mockImplementation(() => Promise.resolve(true));

      component.logout();

      expect(sessionServiceMock.logOut).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['']);

      navigateSpy.mockRestore();
    });
  });

  describe('template', () => {
    it('should show the login and register links when logged out', () => {
      const text = fixture.nativeElement.textContent as string;

      expect(text).toContain('Login');
      expect(text).toContain('Register');
      expect(text).not.toContain('Logout');
    });

    it('should show the logout link when logged in', () => {
      sessionServiceMock.$isLogged.mockReturnValue(of(true));
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent as string;

      expect(text).toContain('Logout');
      expect(text).toContain('Sessions');
      expect(text).not.toContain('Login');
      expect(text).not.toContain('Register');
    });
  });
});