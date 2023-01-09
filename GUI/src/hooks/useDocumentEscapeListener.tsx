import { useLayoutEffect } from 'react';

const useDocumentEscapeListener = (callback: () => void) => {
  useLayoutEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keyup', handleKeyUp);

    return () => document.removeEventListener('keyup', handleKeyUp);
  }, [callback]);
};

export default useDocumentEscapeListener;
