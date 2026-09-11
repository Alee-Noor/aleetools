'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export function AccordionItem({ question, answer, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="accordion-item py-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="accordion-trigger group"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-left pr-4" style={{ color: 'var(--ink)' }}>
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform duration-200 text-stone-500 group-hover:text-stone-800 dark:group-hover:text-stone-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="accordion-content pb-4 pt-1 text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          {answer}
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  items: { q: string; a: string }[];
  className?: string;
}

export function Accordion({ items, className = '' }: AccordionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`divide-y divide-stone-200 dark:divide-stone-800 ${className}`}>
      {items.map((item, idx) => (
        <AccordionItem
          key={idx}
          question={item.q}
          answer={item.a}
          defaultOpen={idx === 0}
        />
      ))}
    </div>
  );
}
