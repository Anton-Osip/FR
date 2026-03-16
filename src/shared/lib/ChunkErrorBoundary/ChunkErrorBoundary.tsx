import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error Boundary для перехвата ошибок загрузки chunk.
 * Автоматически перезагружает страницу при обнаружении ошибок загрузки модулей.
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    const errorMessage = error?.message || String(error);

    if (
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('error loading dynamically imported module') ||
      errorMessage.includes('MIME type') ||
      errorMessage.includes('was blocked due to an unresolved MIME-type')
    ) {
      window.location.reload();
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
