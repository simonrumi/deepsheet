import React from 'react';

// see https://reactjs.org/docs/error-boundaries.html
class ErrorBoundary extends React.Component {
   constructor(props) {
      super(props);
      this.state = { hasError: false };
   }

   static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
   }

   componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      //console.log('caught component error with this info:', errorInfo);
      //console.log('caught component error:', error);
   }

   render() {
      if (this.state.hasError) {
         // You can render any custom fallback UI
         return <h1>Something went wrong.</h1>;
      }

      return this.props.children;
   }
}
