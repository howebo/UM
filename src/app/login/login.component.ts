import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  users?: any[];
  username: string = '';
  password: string = '';

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http
      .get<any[]>('http://localhost:3000/api/users')
      .subscribe((users) => {
        this.users = users;
      });
  }
  login() {
    const user = this.users?.find(
      (u) => u.username === this.username && u.password === this.password
    );

    if (user) {
      console.log('Login successful:', user);
      this.router.navigate(['/user-dashboard', { id: user._id }]);
    } else {
      console.log('Invalid credentials');
    }
  }
  register() {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      data: {
        username: this.username,
        password: this.password,
        editMode: false,
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const newUser = {
          username: result.username,
          password: result.password,
          role: result.role,
          gender: result.gender,
          email: result.email,
          phone: result.phone,
        };
        this.http
          .post('http://localhost:3000/api/register', newUser)
          .pipe(
            tap((response) => {
              console.log('Registration successful:', response);
            })
          )
          .subscribe(() => {
            // Fetch users again after registration
            this.userService.getUsers().subscribe(
              (users: any) => {
                this.users = users;
              },
              (error) => {
                console.error('Error fetching users:', error);
              }
            );
          });
        this.http
          .get<any[]>('http://localhost:3000/api/users')
          .subscribe((users) => {
            this.users = users;
          });
        console.log('User registered:', result);
      }
    });
  }
}
