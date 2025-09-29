import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Todo, TodoResponse } from "../../models/todo.model";
import { AuthService } from "../../services/auth.service";
import { TodoService } from "../../services/todo.service";

@Component({
  selector: "app-todo-list",
  templateUrl: "./todo-list.component.html",
  styleUrls: ["./todo-list.component.css"],
})
export class TodoListComponent implements OnInit, OnDestroy {
  todos: Todo[] = [];
  loading = false;
  error = "";
  currentUser: any;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private todoService: TodoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadTodos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTodos(): void {
    this.loading = true;
    this.error = "";

    const skip = (this.currentPage - 1) * this.itemsPerPage;

    this.todoService
      .getTodos(this.itemsPerPage, skip)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: TodoResponse) => {
          this.todos = response.todos;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.loading = false;
        },
        (error) => {
          this.error = "Failed to load todos. Please try again.";
          this.loading = false;
          console.error("Load todos error:", error);
        }
      );
  }

  toggleTodoStatus(todo: Todo): void {
    const updates = { completed: !todo.completed };

    this.todoService
      .updateTodo(todo.id, updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (updatedTodo: Todo) => {
          // Update the local todo item
          const index = this.todos.findIndex((t) => t.id === todo.id);
          if (index !== -1) {
            this.todos[index] = {
              ...this.todos[index],
              completed: updatedTodo.completed,
            };
          }
        },
        (error) => {
          console.error("Update todo error:", error);
          this.error = "Failed to update todo status.";
        }
      );
  }

  deleteTodo(todo: Todo): void {
    if (confirm(`Are you sure you want to delete "${todo.todo}"?`)) {
      this.todoService
        .deleteTodo(todo.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          () => {
            // Remove from local array
            this.todos = this.todos.filter((t) => t.id !== todo.id);
            this.totalItems--;

            // Reload if current page is empty and not the first page
            if (this.todos.length === 0 && this.currentPage > 1) {
              this.currentPage--;
              this.loadTodos();
            }
          },
          (error) => {
            console.error("Delete todo error:", error);
            this.error = "Failed to delete todo.";
          }
        );
    }
  }

  editTodo(todo: Todo): void {
    this.router.navigate(["/todos/edit", todo.id]);
  }

  createNewTodo(): void {
    this.router.navigate(["/todos/create"]);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadTodos();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  get pages(): number[] {
    const pages = [];
    const maxPages = 5; // Show maximum 5 page numbers
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
