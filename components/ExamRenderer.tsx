import React from 'react';
import { ExamData } from '../types';

interface Props {
  data: ExamData;
  customLogo?: string | null;
  customHeaderText?: string;
}

export const ExamRenderer: React.FC<Props> = ({ data, customLogo, customHeaderText }) => {
  return (
    <div id="print-area" className="bg-white shadow-lg mx-auto w-full max-w-[210mm] min-h-[297mm] p-12 mb-8 relative border border-gray-200 font-serif text-gray-900">
      
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-6 flex flex-col items-center">
        {customLogo && (
            <img src={customLogo} alt="Institution Logo" className="h-24 mb-4 object-contain" />
        )}
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">
            {customHeaderText ? customHeaderText : data.institution}
        </h1>
        <h2 className="text-xl font-bold mb-4">{data.subject} Examination</h2>
        
        <div className="flex justify-between items-center text-sm font-semibold border-t border-black pt-4 w-full">
            <div>
                <p>Grade: {data.grade}</p>
                <p>Date: {data.date || "________________"}</p>
            </div>
            <div className="text-right">
                <p>Duration: {data.duration}</p>
                <p>Total Marks: {data.questions.reduce((acc, q) => acc + (q.marks || 0), 0)}</p>
            </div>
        </div>
      </div>

      {/* Instructions */}
      {data.instructions && data.instructions.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold mb-2 uppercase text-sm">Instructions:</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
                {data.instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                ))}
            </ul>
          </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {data.questions.map((q, idx) => (
            <div key={q.id || idx} className="flex gap-4 break-inside-avoid">
                <div className="font-bold w-8 shrink-0">{q.number}.</div>
                <div className="flex-grow">
                    <p className="leading-relaxed whitespace-pre-line">{q.text}</p>
                    <div className="mt-4 border-b border-dotted border-gray-300 w-full h-6"></div>
                    <div className="mt-4 border-b border-dotted border-gray-300 w-full h-6"></div>
                    {/* Add more lines for longer answers based on marks? Simple heuristic */}
                    {q.marks > 2 && <div className="mt-4 border-b border-dotted border-gray-300 w-full h-6"></div>}
                </div>
                <div className="font-bold text-sm shrink-0 pt-1">
                    [{q.marks}]
                </div>
            </div>
        ))}
      </div>

       {/* Footer */}
       <div className="fixed bottom-0 left-0 w-full bg-white border-t p-2 text-center text-xs text-gray-400 print:absolute print:bottom-4">
         {customHeaderText ? customHeaderText : "Page 1 of 1"}
      </div>
    </div>
  );
};