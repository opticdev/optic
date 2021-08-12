import React, { FC, useState, useRef, useEffect } from 'react';

type HighlightControllerProps = {
  children: (
    selectedItem: string | null,
    setSelectedItem: (selectedItem: string | null) => void,
    rootElementRef: React.RefObject<HTMLElement | null>
  ) => React.ReactElement;
};

export const HighlightController: FC<HighlightControllerProps> = ({
  children,
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const rootElementRef: React.RefObject<HTMLElement | null> = useRef(null);

  useEffect(() => {
    console.log('root element', rootElementRef?.current);

    const onDocumentClick = (event: MouseEvent) => {
      const rootElement = rootElementRef?.current;

      console.log(rootElement?.contains(event.target as Node));
      if (rootElement && !rootElement.contains(event.target as Node)) {
        setSelectedItem(null);
      }
    };

    document.addEventListener('click', onDocumentClick);

    return () => {
      document.removeEventListener('click', onDocumentClick);
    };
  }, [rootElementRef, setSelectedItem]);

  return <>{children(selectedItem, setSelectedItem, rootElementRef)}</>;
};
