import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

interface Props {
    items: FAQItem[];
}

function AccordionItem({ question, answer, isOpen, onToggle }: {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border-b border-slate-200 last:border-0 p-1">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-left gap-4 cursor-pointer group"
            >
                <span className={`text-sm px-2 font-semibold transition-colors duration-200 ${isOpen ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                    {question}
                </span>
                <span
                    className="shrink-0 w-5 h-5 mr-2 rounded-full border border-slate-200 flex items-center justify-center transition-all duration-300"
                    style={{ 
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', 
                        background: isOpen ? '#0f172a' : 'transparent', 
                        borderColor: isOpen ? '#0f172a' : undefined 
                    }}
                >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <line x1="4" y1="1" x2="4" y2="7" stroke={isOpen ? '#fff' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="1" y1="4" x2="7" y2="4" stroke={isOpen ? '#fff' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </span>
            </button>

            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="overflow-hidden">
                    <p className="text-sm text-slate-500 leading-relaxed pb-4 px-2 pr-8">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Accordion({ items }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            {items.map((item, i) => (
                <AccordionItem
                    key={i}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === i}
                    onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
            ))}
        </div>
    );
}