import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import type {
  Card,
  Classroom,
  Paginated,
  Register,
  Reserve,
  Teacher,
} from '../types/index';

const API_BASE_URL = 'http://localhost:3000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

async function apiCall<T>(
  endpoint: string,
  method: AxiosRequestConfig['method'] = 'GET',
  body?: object,
): Promise<T> {
  try {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data: body,
    };

    const response: AxiosResponse<T> = await api(config);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Erro inesperado';
      throw new Error(errorMessage);
    }

    throw new Error('Erro desconhecido.');
  }
}

// Session
export const createSession = (data: { protocol: string; password: string }) =>
  apiCall<Teacher>('session', 'POST', data);
export const getMe = () => apiCall<Teacher>('session/me');

// Classroom
export const listClassrooms = () => apiCall<Paginated<Classroom>>('classroom');
export const createClassroom = (data: Omit<Classroom, 'id'>) =>
  apiCall<Classroom>('classroom', 'POST', data);
export const deleteClassroom = (classroomId: number) =>
  apiCall<Classroom>(`classroom/${classroomId}`, 'DELETE');
export const activateCreationMode = (classroomId: number) =>
  apiCall<void>(`classroom/${classroomId}/activate-creation-mode`, 'POST');
export const forceFree = (classroomId: number) =>
  apiCall<void>(`classroom/${classroomId}/force-free`, 'POST');

// Teacher
export const listTeachers = () => apiCall<Paginated<Teacher>>('teacher');
export const createTeacher = (
  data: Omit<Teacher, 'id'> & { password: string },
) => apiCall<Teacher>('teacher', 'POST', data);
export const deleteTeacher = (id: number) =>
  apiCall<Teacher>(`teacher/${id}`, 'DELETE');

// Card
export const listCards = () => apiCall<Paginated<Card>>('card');
export const deleteCard = (cardId: number) =>
  apiCall<Card>(`card/${cardId}`, 'DELETE');
export const assignTeacher = (cardId: number, teacherId: number) =>
  apiCall<Card>(`card/${cardId}/assign-teacher`, 'PATCH', {
    teacher_id: teacherId,
  });

// Reserve
export const listReserves = () => apiCall<Paginated<Reserve>>('reserve');
export const createReserve = (data: Omit<Reserve, 'id'>) =>
  apiCall<Reserve>('reserve', 'POST', data);
export const deleteReserva = (reservaId: number) =>
  apiCall<Reserve>(`reserve/${reservaId}`, 'DELETE');

// Register
export const listRegisters = (data: {
  classroomId?: number;
  teacherId?: number;
}) => {
  const params = new URLSearchParams();

  if (data.classroomId) {
    params.append('classroom_id', data.classroomId.toString());
  }

  if (data.teacherId) {
    params.append('teacher_id', data.teacherId.toString());
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';

  return apiCall<Paginated<Register>>(`register${queryString}`);
};
