import React, { useState } from 'react';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';

interface MarkdownifyProps {
  message: string | undefined;
  sanitizeLinks?: boolean;
}

const isValidImageUrl = (s: string): boolean => {
  try {
    const u = new URL(s);
    if (!/^(https?|data):$/i.test(u.protocol)) return false;
    if (s.startsWith('data:image/')) {
      return /^data:image\/(png|jpe?g|gif|webp|svg\+xml|bmp);(base64,|charset=utf-8;)/i.test(s);
    }
    const path = u.pathname.toLowerCase();
    const search = u.search.toLowerCase();
    if (/\.(png|jpe?g|gif|webp|svg|ico|bmp|tiff?|avif|heic|heif|apng)([?#]|$)/i.test(path)) {
      return true;
    }
    if (/\/(images?|img|photos?|pictures?|media|uploads?|thumb|avatar)\//i.test(path)) {
      return true;
    }
    return /[?&](format|type|image|img|photo)=(png|jpe?g|gif|webp|svg|ico)/i.test(search);
  } catch {
    return false;
  }
};

const ensureAbsoluteUrl = (href: string): string => {
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(href) || href.startsWith('//')) {
    return href;
  }
  return `https://${href}`;
};

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
      <a href={ensureAbsoluteUrl(href)} target="_blank" rel="noopener noreferrer">
        {href}
      </a>
    );
  }

  if (!isValidImageUrl(href)) {
    return (
      <a href={ensureAbsoluteUrl(href)} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return hasError ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <img
      src={href}
      alt={typeof children === 'string' ? children : 'Preview'}
      style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }}
      onError={() => setHasError(true)}
    />
  );
};

const hasSpecialFormat = (m: string) => m.includes('\n\n') && m.indexOf('.') > 0 && m.indexOf(':') > m.indexOf('.');

const htmlLinkToMarkdown = (value: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = value;
  const links = tempDiv.querySelectorAll('a');

  let result = value;
  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const text = link.textContent || href;
    const markdown = href ? `[${text}](${ensureAbsoluteUrl(href)})` : text;
    result = result.replace(link.outerHTML, markdown);
  });

  return result;
};

function formatMessage(message?: string): string {
  const sanitizedMessage = sanitizeHtml(message ?? '');

  if (!sanitizedMessage) return '';

  const filteredMessage = sanitizedMessage
    .replaceAll(/\\?\$b\w*/g, '')
    .replaceAll(/\\?\$v\w*/g, '')
    .replaceAll(/\\?\$g\w*/g, '');

  const dataImagePattern = /((?:^|\s))(data:image\/[a-z0-9+]+;[^)\s]+)/gi;
  const finalMessage = filteredMessage.replaceAll(
    dataImagePattern,
    (_, prefix, dataUrl) => `${prefix}[image](${dataUrl})`,
  );
  const markdownLinksMessage = htmlLinkToMarkdown(finalMessage);

  return markdownLinksMessage
    .replaceAll(/&#x([0-9A-F]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replaceAll('&amp;', '&')
    .replaceAll('&gt;', '>')
    .replaceAll('&lt;', '<')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll(/(^|\n)(\d{4})\.\s/g, (match, prefix, year) => {
      const remainingText = finalMessage.substring(finalMessage.indexOf(match) + match.length);
      const sentenceEnd = remainingText.indexOf('\n\n');
      if (sentenceEnd !== -1) {
        const currentSentence = remainingText.substring(0, sentenceEnd);
        if (currentSentence.trim().endsWith(':')) {
          return `${prefix}${year}. `;
        }
      }
      return String.raw`${prefix}${year}\. `;
    })
    .replaceAll(/(?<=\n)\d+\.\s/g, hasSpecialFormat(finalMessage) ? '\n\n$&' : '$&')
    .replaceAll(/^(\s+)/g, (match) => match.replaceAll(' ', '&nbsp;'));
}

const Markdownify: React.FC<MarkdownifyProps> = ({ message, sanitizeLinks = false }) => (
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
      {formatMessage(message)}
    </Markdown>
  </div>
);

export default Markdownify;
