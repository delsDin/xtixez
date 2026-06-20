import React from 'react';

// Simple inline parser for bold and italics
function parseInlineMarkdown(text: string): React.ReactNode {
  // Split by **bold**, __bold__, *italic*, or _italic_
  const parts = text.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <strong key={index} className="font-extrabold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

interface MarkdownDescriptionProps {
  text: string;
  className?: string;
}

export const MarkdownDescription: React.FC<MarkdownDescriptionProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split text by lines
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let keyCounter = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`ul-${keyCounter++}`} className="list-disc pl-5 mb-4 space-y-1">
            {currentList}
          </ul>
        );
      } else if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${keyCounter++}`} className="list-decimal pl-5 mb-4 space-y-1">
            {currentList}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      // Empty line splits paragraphs or ends list
      flushList();
      continue;
    }

    // Check if line is an unordered list item
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      const content = trimmedLine.replace(/^[-*]\s+/, '');
      currentList.push(
        <li key={`li-${keyCounter++}`}>
          {parseInlineMarkdown(content)}
        </li>
      );
      continue;
    }

    // Check if line is an ordered list item
    const matchOl = trimmedLine.match(/^(\d+)\.\s+/);
    if (matchOl) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      const content = trimmedLine.replace(/^\d+\.\s+/, '');
      currentList.push(
        <li key={`li-${keyCounter++}`}>
          {parseInlineMarkdown(content)}
        </li>
      );
      continue;
    }

    // Otherwise it's a regular text line
    flushList();

    elements.push(
      <p key={`p-${keyCounter++}`} className="mb-4">
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  // Flush any remaining list items at the end
  flushList();

  return <div className={className}>{elements}</div>;
};
