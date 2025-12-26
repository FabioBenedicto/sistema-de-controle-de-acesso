import { format } from 'date-fns';

export const formatDateTime = (date_string: string): string => {
  try {
    const date = new Date(date_string);
    return format(date, "dd/MM/yyyy 'às' HH:mm:ss");
  } catch {
    return 'Data Inválida';
  }
};
