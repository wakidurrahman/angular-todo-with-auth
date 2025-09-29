import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./components/auth/login.component";
import { TodoFormComponent } from "./components/todo/todo-form.component";
import { TodoListComponent } from "./components/todo/todo-list.component";
import { AuthGuard } from "./guards/auth.guard";

const routes: Routes = [
  { path: "", redirectTo: "/todos", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  {
    path: "todos",
    component: TodoListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "todos/create",
    component: TodoFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "todos/edit/:id",
    component: TodoFormComponent,
    canActivate: [AuthGuard],
  },
  { path: "**", redirectTo: "/todos" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
