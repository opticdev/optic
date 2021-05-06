import { createWidget } from '@typeform/embed';
import '@typeform/embed/build/css/widget.css';
import React, { useRef, useEffect } from 'react';

export function Typeform({ formId }) {
  const container = useRef();

  useEffect(() => {
    createWidget(formId, {
      container: container.current,
      hideFooter: true,
      hideHeaders: true,
    });
  }, []);

  const styles = { width: '100%', height: '600px' };

  return <div style={styles} ref={container} />;
}
