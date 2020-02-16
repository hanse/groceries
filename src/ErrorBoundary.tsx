import React, { Component, ReactNode } from 'react';

type Props = {
  fallback: ReactNode;
};

class ErrorBoundary extends Component<Props> {
  state = {
    error: false
  };

  static defaultProps = {
    fallback: <div>Error</div>
  };

  static getDerivedStateFromError() {
    return {
      error: true
    };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
