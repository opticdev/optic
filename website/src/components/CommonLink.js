import KeyConcepts from '../../docs/reference/key-concepts.mdx';
import Document from '../../docs/document/document.mdx';
import React from 'react';
import { PreviewPageModalFakeLink } from './Modal';

export const CommonLinks = {
  Coverage: () => (
    <PreviewPageModalFakeLink
      linkText={'API Coverage'}
      link={'/reference'}
      title={`Key Concepts`}
      source={<KeyConcepts />}
    />
  ),
  Document: ({ text }) => (
    <PreviewPageModalFakeLink
      linkText={text}
      link={'/document'}
      title={`Document your API with Optic`}
      source={<Document />}
    />
  ),
};
