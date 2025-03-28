import React, { useState } from 'react';
import Markdown from 'markdown-to-jsx';
import './Chat.scss';

interface MarkdownifyProps {
  message: string | undefined;
}

const LinkPreview: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  const [hasError, setHasError] = useState(false);
  const basicAuthPattern = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\/[^@]+@/;

  if (basicAuthPattern.test(href)) {
    return null;
  }

  return !hasError ? (
    <img
      src={href}
      alt={typeof children === "string" ? children : "Preview"}
      style={{ maxWidth: "100%", height: "auto", borderRadius: "20px" }}
      onError={() => setHasError(true)}
    />
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

const Markdownify: React.FC<MarkdownifyProps> = ({ message }) => (
  <div className={'reset'}>
    <Markdown
      options={{
        enforceAtxHeadings: true,
        overrides: {
          a: {
            component: LinkPreview,
          },
        },
        disableParsingRawHTML: true,
      }}
    >
      {message?.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => { return String.fromCharCode(parseInt(hex, 16)); }) ?? ""}
    </Markdown>
  </div>
);

export default Markdownify;
