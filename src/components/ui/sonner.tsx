import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

export const Toaster = ({ theme: propTheme, ...props }: ToasterProps) => {
  const { mode } = useTheme();
  const resolvedTheme = (propTheme ?? mode) as 'light' | 'dark';

  return (
    <Sonner
      theme={resolvedTheme}
      className="kgf-admin-toaster"
      position="top-right"
      richColors
      closeButton
      expand
      visibleToasts={4}
      toastOptions={{
        classNames: {
          toast: 'kgf-admin-toast',
          title: 'kgf-admin-toast-title',
          description: 'kgf-admin-toast-description',
          success: 'kgf-admin-toast-success',
          error: 'kgf-admin-toast-error',
          warning: 'kgf-admin-toast-warning',
          info: 'kgf-admin-toast-info',
        },
      }}
      style={
        {
          '--normal-bg': resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff',
          '--normal-text': resolvedTheme === 'dark' ? '#f5f5f5' : '#1a1a1a',
          '--normal-border':
            resolvedTheme === 'dark' ? 'rgba(245, 211, 0, 0.25)' : 'rgba(230, 194, 0, 0.35)',
        } as CSSProperties
      }
      {...props}
    />
  );
};
