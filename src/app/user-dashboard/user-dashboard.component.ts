import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
})
export class UserDashboardComponent {
  users: any;
  loggedInUserRole: any;
  currentUserId: any;
  currentUser: any;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      this.currentUserId = this.route.snapshot.paramMap.get('id');
      this.currentUser = this.findCurrentUser();
      this.loggedInUserRole = this.currentUser.role;
    });
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      data: { editMode: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
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
        .subscribe((response) => {
          console.log('Registration successful:', response);
        });
      this.fetchUsers();
    });
  }

  openEditUserDialog(user: any) {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      data: { ...user, editMode: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updateUser = {
          username: result.username,
          password: result.password,
          role: result.role,
          gender: result.gender,
          email: result.email,
          phone: result.phone,
        };
        this.http
          .put(`http://localhost:3000/api/users/${user._id}`, updateUser)
          .subscribe(
            (updatedUser) => {
              console.log('Updating user:', updatedUser);
              // Update local users array
              const index = this.users.findIndex(
                (u: any) => u._id === user._id
              );
              if (index !== -1) {
                this.users[index] = updatedUser;
              }
            },
            (error) => {
              console.error('Error updating user:', error);
            }
          );
        this.fetchUsers();
        this.ngOnInit();
      }
    });
  }

  fetchUsers() {
    this.http
      .get<any[]>('http://localhost:3000/api/users')
      .subscribe((users) => {
        this.users = users;
      });
  }

  isSuperAdmin(): boolean {
    return this.loggedInUserRole === 'superadmin';
  }

  isAdmin(): boolean {
    return this.loggedInUserRole === 'admin';
  }

  isUser(user: any): boolean {
    return user.role === 'user';
  }

  canEdit(user: any): boolean {
    return (
      this.isSuperAdmin() ||
      (this.isUser(user) && user._id.toString() === this.currentUserId)
    );
  }

  canDelete(): boolean {
    return this.isSuperAdmin() || this.isAdmin();
  }

  findCurrentUser(): any {
    return this.users.find((u: any) => u._id === this.currentUserId);
  }

  deleteUser(user: any) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`http://localhost:3000/api/users/${user._id}`).subscribe(
        () => {
          if (user._id === this.currentUserId) {
            this.router.navigate(['']);
          }
          console.log('User deleted successfully');
          // After deletion, fetch users again
          this.userService.getUsers().subscribe(
            (users) => {
              this.users = users;
            },
            (error) => {
              console.error('Error fetching users:', error);
            }
          );
        },
        (error: any) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }
}
