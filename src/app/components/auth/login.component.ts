import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = "";

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect to todos if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(["/todos"]);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });

    // Get return url from route parameters or default to '/todos'
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/todos";
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = "";

    const credentials = {
      username: this.f.username.value,
      password: this.f.password.value,
      expiresInMins: 30,
    };

    this.authService
      .login(credentials)
      .pipe(first())
      .subscribe(
        (data) => {
          this.router.navigate([this.returnUrl]);
        },
        (error) => {
          this.error =
            (error.error && error.error.message) ||
            "Login failed. Please try again.";
          this.loading = false;
        }
      );
  }

  // Sample credentials for demo
  fillSampleCredentials(): void {
    this.loginForm.patchValue({
      username: "emilys",
      password: "emilyspass",
    });
  }
}
