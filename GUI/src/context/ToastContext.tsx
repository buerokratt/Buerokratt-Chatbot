import * as RadixToast from '@radix-ui/react-toast';
import { Toast } from 'components';
import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { generateUEID } from 'utils/generateUEID';

export type ToastType = {
  type: 'info' | 'success' | 'error' | 'warning';
  title: string;
  message: ReactNode;
  duration?: number;
};

type ToastTypeWithId = ToastType & { id: string };

type ToastContextType = {
  open: (toast: ToastType) => void;
};

const TOAST_GAP = 8;

export const ToastContext = createContext<ToastContextType>(null!);

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<ToastTypeWithId[]>([]);
  const listRef = useRef<HTMLOListElement>(null);
  const [expanded, setExpanded] = useState(false);

  const layoutToasts = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const items = Array.from(list.querySelectorAll<HTMLElement>(':scope > .toast'));
    if (items.length === 0) {
      setExpanded(false);
      return;
    }

    if (!expanded) return;

    let offset = 0;
    for (let i = items.length - 1; i >= 0; i--) {
      items[i].style.setProperty('--toast-offset', `${offset}px`);
      offset += items[i].offsetHeight + TOAST_GAP;
    }
    list.style.setProperty('--toast-list-height', `${offset - TOAST_GAP}px`);
  }, [expanded]);

  useLayoutEffect(() => {
    layoutToasts();
  }, [layoutToasts, toasts]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new MutationObserver(layoutToasts);
    observer.observe(list, { childList: true });
    return () => observer.disconnect();
  }, [layoutToasts]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const expand = () => setExpanded(true);
    const collapse = () => setExpanded(false);
    list.addEventListener('mouseenter', expand);
    list.addEventListener('mouseleave', collapse);
    return () => {
      list.removeEventListener('mouseenter', expand);
      list.removeEventListener('mouseleave', collapse);
    };
  }, []);

  const open = (content: ToastType) => {
    setToasts((prevState) => [...prevState, { id: generateUEID(), ...content }]);
  };
  const close = (id: string) => {
    setToasts((prevState) => prevState.filter((toast) => toast.id === id));
  };

  const contextValue = useMemo(() => ({ open }), []);

  return (
    <ToastContext.Provider value={contextValue}>
      <RadixToast.Provider swipeDirection="right" label={t('global.notification') ?? 'Notification'}>
        {children}
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} close={() => close(toast.id)} />
        ))}
        <RadixToast.Viewport ref={listRef} className="toast__list" data-expanded={expanded} />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
};
