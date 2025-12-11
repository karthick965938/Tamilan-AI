import { ToastProps, ToastType } from '../components/Toast/Toast';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface CreateToastOptions extends ToastOptions {
  title: string;
  message?: string;
}

/**
 * Toast notification service
 */
export class ToastService {
  private static instance: ToastService;
  private listeners: ((toasts: ToastProps[]) => void)[] = [];
  private toasts: ToastProps[] = [];
  private idCounter = 0;

  private constructor() {}

  static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  /**
   * Subscribe to toast updates
   */
  subscribe(listener: (toasts: ToastProps[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Create a new toast notification
   */
  create(options: CreateToastOptions): string {
    const id = `toast-${++this.idCounter}`;
    const toast: ToastProps = {
      id,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration ?? 5000,
      onClose: this.remove.bind(this),
      action: options.action
    };

    this.toasts.push(toast);
    this.notifyListeners();
    
    return id;
  }

  /**
   * Create a success toast
   */
  success(title: string, message?: string, options?: ToastOptions): string {
    return this.create({
      ...options,
      type: 'success',
      title,
      message
    });
  }

  /**
   * Create an error toast
   */
  error(title: string, message?: string, options?: ToastOptions): string {
    return this.create({
      ...options,
      type: 'error',
      title,
      message,
      duration: options?.duration ?? 8000 // Longer duration for errors
    });
  }

  /**
   * Create a warning toast
   */
  warning(title: string, message?: string, options?: ToastOptions): string {
    return this.create({
      ...options,
      type: 'warning',
      title,
      message
    });
  }

  /**
   * Create an info toast
   */
  info(title: string, message?: string, options?: ToastOptions): string {
    return this.create({
      ...options,
      type: 'info',
      title,
      message
    });
  }

  /**
   * Remove a toast by ID
   */
  remove(id: string): void {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index > -1) {
      this.toasts.splice(index, 1);
      this.notifyListeners();
    }
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toasts = [];
    this.notifyListeners();
  }

  /**
   * Get current toasts
   */
  getToasts(): ToastProps[] {
    return [...this.toasts];
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.toasts]);
    });
  }
}

export const toastService = ToastService.getInstance();