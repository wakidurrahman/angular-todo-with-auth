import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import {
  CreateTodoRequest,
  Todo,
  TodoResponse,
  UpdateTodoRequest,
} from "../models/todo.model";

@Injectable({
  providedIn: "root",
})
export class TodoService {
  private readonly API_URL = "https://dummyjson.com/todos";

  constructor(private http: HttpClient) {}

  getTodos(limit: number = 30, skip: number = 0): Observable<TodoResponse> {
    let params = new HttpParams();
    if (limit > 0) {
      params = params.set("limit", limit.toString());
    }
    if (skip > 0) {
      params = params.set("skip", skip.toString());
    }

    return this.http.get<TodoResponse>(this.API_URL, { params }).pipe(
      catchError((error) => {
        console.error("Get todos error:", error);
        return throwError(error);
      })
    );
  }

  getTodoById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        console.error("Get todo by id error:", error);
        return throwError(error);
      })
    );
  }

  getTodosByUserId(userId: number): Observable<TodoResponse> {
    return this.http.get<TodoResponse>(`${this.API_URL}/user/${userId}`).pipe(
      catchError((error) => {
        console.error("Get todos by user id error:", error);
        return throwError(error);
      })
    );
  }

  createTodo(todo: CreateTodoRequest): Observable<Todo> {
    return this.http.post<Todo>(`${this.API_URL}/add`, todo).pipe(
      catchError((error) => {
        console.error("Create todo error:", error);
        return throwError(error);
      })
    );
  }

  updateTodo(id: number, updates: UpdateTodoRequest): Observable<Todo> {
    return this.http.put<Todo>(`${this.API_URL}/${id}`, updates).pipe(
      catchError((error) => {
        console.error("Update todo error:", error);
        return throwError(error);
      })
    );
  }

  deleteTodo(id: number): Observable<Todo> {
    return this.http.delete<Todo>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        console.error("Delete todo error:", error);
        return throwError(error);
      })
    );
  }

  getRandomTodo(): Observable<Todo> {
    return this.http.get<Todo>(`${this.API_URL}/random`).pipe(
      catchError((error) => {
        console.error("Get random todo error:", error);
        return throwError(error);
      })
    );
  }
}
