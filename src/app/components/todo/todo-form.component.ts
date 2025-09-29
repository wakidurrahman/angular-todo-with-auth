import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { first, takeUntil } from "rxjs/operators";
import { Todo } from "../../models/todo.model";
import { AuthService } from "../../services/auth.service";
import { TodoService } from "../../services/todo.service";

@Component({
  selector: "app-todo-form",
  templateUrl: "./todo-form.component.html",
  styleUrls: ["./todo-form.component.css"],
})
export class TodoFormComponent implements OnInit, OnDestroy {
  todoForm: FormGroup;
  loading = false;
  submitted = false;
  error = "";
  isEditMode = false;
  todoId: number | null = null;
  currentUser: any;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private todoService: TodoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    // Check if we're in edit mode
    this.todoId = this.route.snapshot.params["id"]
      ? +this.route.snapshot.params["id"]
      : null;
    this.isEditMode = !!this.todoId;

    this.initializeForm();

    if (this.isEditMode && this.todoId) {
      this.loadTodo();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.todoForm = this.formBuilder.group({
      todo: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      completed: [false],
    });
  }

  private loadTodo(): void {
    if (!this.todoId) return;

    this.loading = true;
    this.todoService
      .getTodoById(this.todoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (todo: Todo) => {
          this.todoForm.patchValue({
            todo: todo.todo,
            completed: todo.completed,
          });
          this.loading = false;
        },
        (error) => {
          console.error("Load todo error:", error);
          this.error = "Failed to load todo. Please try again.";
          this.loading = false;
        }
      );
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.todoForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.todoForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = "";

    if (this.isEditMode && this.todoId) {
      this.updateTodo();
    } else {
      this.createTodo();
    }
  }

  private createTodo(): void {
    const todoData = {
      todo: this.f.todo.value,
      completed: this.f.completed.value,
      userId: (this.currentUser && this.currentUser.id) || 1,
    };

    this.todoService
      .createTodo(todoData)
      .pipe(first())
      .subscribe(
        (response: Todo) => {
          this.router.navigate(["/todos"], {
            queryParams: { message: "Todo created successfully!" },
          });
        },
        (error) => {
          console.error("Create todo error:", error);
          this.error =
            (error.error && error.error.message) ||
            "Failed to create todo. Please try again.";
          this.loading = false;
        }
      );
  }

  private updateTodo(): void {
    if (!this.todoId) return;

    const updates = {
      todo: this.f.todo.value,
      completed: this.f.completed.value,
    };

    this.todoService
      .updateTodo(this.todoId, updates)
      .pipe(first())
      .subscribe(
        (response: Todo) => {
          this.router.navigate(["/todos"], {
            queryParams: { message: "Todo updated successfully!" },
          });
        },
        (error) => {
          console.error("Update todo error:", error);
          this.error =
            (error.error && error.error.message) ||
            "Failed to update todo. Please try again.";
          this.loading = false;
        }
      );
  }

  cancel(): void {
    this.router.navigate(["/todos"]);
  }

  get pageTitle(): string {
    return this.isEditMode ? "Edit Todo" : "Create New Todo";
  }

  get submitButtonText(): string {
    if (this.loading) {
      return this.isEditMode ? "Updating..." : "Creating...";
    }
    return this.isEditMode ? "Update Todo" : "Create Todo";
  }
}
