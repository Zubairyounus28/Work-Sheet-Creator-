import React from 'react';
import { ExamData } from '../types';

interface Props {
  data: ExamData;
  customLogo?: string | null;
  customHeaderText?: string;
}

export const ExamRenderer: React.FC<Props> = ({ data, customLogo, customHeaderText }) => {
  return (
    <div id="print-area" className="bg-white shadow-xl mx-auto w-full max-w-[210mm] min-h-[297mm] p-[25mm] mb-8 relative border border-gray-200 font-serif text-black leading-relaxed">
      
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-4 flex flex-col items-center">
        {customLogo && (
            <img src={customLogo} alt="Institution Logo" className="h-20 mb-3 object-contain" />
        )}
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">
            {customHeaderText ? customHeaderText : data.institution}
        </h1>
        <h2 className="text-xl font-bold uppercase mb-4">{data.subject} Examination</h2>
        
        <div className="flex justify-between items-center text-sm font-bold border-t-2 border-black pt-2 w-full mt-2">
            <div className="text-left">
                <p>GRADE: {data.grade}</p>
                <p>DATE: {data.date || "________________"}</p>
            </div>
            <div className="text-right">
                <p>TIME: {data.duration}</p>
                <p>MARKS: {data.questions.reduce((acc, q) => acc + (q.marks || 0), 0)}</p>
            </div>
        </div>
      </div>

      {/* Instructions */}
      {data.instructions && data.instructions.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2 uppercase text-sm underline decoration-1 underline-offset-2">Instructions to Candidates:</h3>
            <ul className="list-disc list-outside ml-5 text-sm space-y-1">
                {data.instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                ))}
            </ul>
          </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {data.questions.map((q, idx) => (
            <div key={q.id || idx} className="flex gap-4 break-inside-avoid relative">
                <div className="font-bold min-w-[1.5rem]">{q.number}.</div>
                <div className="flex-grow">
                    <p className="whitespace-pre-wrap">{q.text}</p>
                    
                    {/* Visual Answer Lines on Screen */}
                    <div className="mt-4 opacity-30 select-none pointer-events-none">
                        <div className="border-b border-black w-full h-8"></div>
                        <div className="border-b border-black w-full h-8"></div>
                        {q.marks > 2 && <div className="border-b border-black w-full h-8"></div>}
                        {q.marks > 4 && <div className="border-b border-black w-full h-8"></div>}
                    </div>
                </div>
                <div className="font-bold text-sm italic pt-1 whitespace-nowrap">
                    [{q.marks} mks]
                </div>
            </div>
        ))}
      </div>

       {/* Footer */}
       <div className="mt-12 pt-8 text-center text-xs italic font-serif">
         *** End of Examination ***
      </div>
    </div>
  );
};