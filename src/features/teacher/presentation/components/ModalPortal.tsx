import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ModalPortalProps = {
  isOpen: boolean;
  children: ReactNode;
};

export function ModalPortal({ isOpen, children }: ModalPortalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(children, document.body);
}
