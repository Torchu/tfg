import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { CredentialsInterface } from 'src/interfaces/credentials.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from 'src/models/login-response';
import { plainToClass } from 'class-transformer';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * The Observable with access_token
   * @type {BehaviorSubject<String>}
   */
  private accessToken: BehaviorSubject<string>;

  /**
   * Api path
   * @type {string}
   */
  private path = '/auth';

  /**
   * Constructor
   * @param {HttpClient} http
   * @param {ApiService} apiService
   */
  constructor(private http: HttpClient, private apiService: ApiService) {
    this.accessToken = new BehaviorSubject<string>('');
    this.path = this.apiService.getApiUrl() + this.path;
  }

  /**
   * Logs the user in
   * @param {CredentialsInterface} credentials Credentials of the user
   * @returns {Observable<string>} The access token
   */
  public login(credentials: CredentialsInterface): Observable<string> {
    this.http
      .post(`${this.path}/login`, credentials)
      .pipe(map((response) => plainToClass(LoginResponse, response)))
      .subscribe({
        next: (response: LoginResponse) => {
          if (response.loginOk) {
            localStorage.setItem('access_token', response.accessToken);
            localStorage.setItem('user', response.user.id);
            this.accessToken.next(response.accessToken);
          } else {
            this.accessToken.next('');
          }
        },
        error: (_error) => {
          this.accessToken.next('');
        }
      });
    return this.accessToken.asObservable();
  }

  /**
   * Whether the user has a valid token or not
   * @returns {boolean}
   */
  public loggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  /**
   * Removes the token from local storage and redirects the user to login page
   */
  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  /**
   * Returns the user
   * @returns {string} The user data
   */
  public getUser(): string {
    return localStorage.getItem('user') || '';
  }
}
