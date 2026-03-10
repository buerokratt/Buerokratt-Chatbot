import { ToastContext } from 'context/ToastContext';
import { useContext } from 'react';

export const useToast = () => useContext(ToastContext);
