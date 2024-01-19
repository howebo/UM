import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/api/users';
  private userDetails: any;

  constructor(private http: HttpClient) {}


  setUserDetails(user: any) {
    this.userDetails = user;
  }

  getUserDetails() {
    return this.userDetails;
  }

  getUsers() {
    return this.http.get(this.apiUrl);
  }

  addUser(user: any) {
    return this.http.post(this.apiUrl, user);
  }

  editUser(userId: string, user: any) {
    return this.http.put(`${this.apiUrl}/${userId}`, user);
  }

  deleteUser(userId: string) {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}
