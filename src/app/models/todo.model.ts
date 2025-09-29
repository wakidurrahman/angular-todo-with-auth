export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId?: number;
}

export interface TodoResponse {
  todos: Todo[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateTodoRequest {
  todo: string;
  completed: boolean;
  userId: number;
}

export interface UpdateTodoRequest {
  completed?: boolean;
  todo?: string;
}
