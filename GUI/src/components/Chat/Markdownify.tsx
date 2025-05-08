import React, { useState } from 'react';
import Markdown from 'markdown-to-jsx';
import './Chat.scss';

interface MarkdownifyProps {
  message: string | undefined;
  sanitizeLinks?: boolean;
}

const LinkPreview: React.FC<{
  href: string;
  children: React.ReactNode;
  sanitizeLinks: boolean;
}> = ({ href, children, sanitizeLinks }) => {
  const [hasError, setHasError] = useState(false);
  const basicAuthPattern = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\/[^@]+@/;

  if (basicAuthPattern.test(href)) {
    return null;
  }

  if (sanitizeLinks) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {href}
      </a>
    );
  }

  return !hasError ? (
    <img
      src={href}
      alt={typeof children === 'string' ? children : 'Preview'}
      style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }}
      onError={() => setHasError(true)}
    />
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

const hasSpecialFormat = (m: string) => m.includes("\n\n") && m.indexOf(".") > 0 && m.indexOf(":") > m.indexOf(".");

const Markdownify: React.FC<MarkdownifyProps> = ({
  message,
  sanitizeLinks = false,
}) => (
  <div className={'reset'}>
    <Markdown
      options={{
        enforceAtxHeadings: true,
        overrides: {
          a: {
            component: LinkPreview,
            props: {
              sanitizeLinks,
            },
          },
        },
        disableParsingRawHTML: true,
      }}
    >
      {message
        ?.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        ?.replace(/(?<=\n)\d+\.\s/g, hasSpecialFormat(message) ? "\n\n$&" : "$&") ?? ""}
    </Markdown>
  </div>
);

export default Markdownify;
