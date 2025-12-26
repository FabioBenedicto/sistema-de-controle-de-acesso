export interface SessionContextType {
  user: Teacher | null;
  isLoading: boolean;
  login: (body: { protocol: string; password: string }) => Promise<void>;
  logout: () => void;
}

export interface Teacher {
  id: number;
  name: string;
  protocol: string;
  password: string;
  is_admin: boolean;
  token?: string;
}

export interface Classroom {
  id: number;
  name: string;
}

export interface Card {
  id: number;
  uid: string;
  created_at: string;

  teacher_id: number;
  teacher: Teacher | null;
}

export interface Reserve {
  id: number;
  entry_datetime: string;
  exit_datetime: string;

  classroom_id: number;
  classroom?: Classroom;

  teacher_id: number;
  teacher?: Teacher;
}

export interface Register {
  id: number;
  entry_datetime: string;
  exit_datetime?: string;

  teacher_id: number;
  teacher?: Teacher;

  classroom_id: number;
  classroom?: Classroom;
}

export interface Paginated<T> {
  data: T[];
  perPage: number;
  total: number;
}
