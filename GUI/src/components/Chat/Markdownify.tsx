import React, { useState } from 'react';
import Markdown from 'markdown-to-jsx';

interface MarkdownifyProps {
  message: string | undefined;
}

const LinkPreview: React.FC<{ href: string }> = ({ href }) => {
  const [hasError, setHasError] = useState(false);
  return !hasError ? (
    <img
      src={href}
      alt="Image Preview"
      style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }}
      onError={() => setHasError(true)}
    />
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {href}
    </a>
  );
};

const Markdownify: React.FC<MarkdownifyProps> = ({ message }) => (
  <div>
    <Markdown
      options={{
        enforceAtxHeadings: true,
        overrides: {
          a: {
            component: LinkPreview,
          },
        },
      }}
    >
      {message ?? ''}
    </Markdown>
  </div>
);

export default Markdownify;
