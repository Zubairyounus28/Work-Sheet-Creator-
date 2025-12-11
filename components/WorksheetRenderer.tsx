import React, { useEffect, useRef, useState } from 'react';
import { WorksheetData, SectionType } from '../types';
import { RefreshCw, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  data: WorksheetData | null;
  worksheetImageUrl?: string | null;
  sourceImage?: string | null;
  customLogo?: string | null;
  customHeaderText?: string;
  onRegenerateImage?: (sectionId: string, prompt: string) => void;
}

const CroppedImage: React.FC<{ src: string; box: number[] }> = ({ src, box }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const [ymin, xmin, ymax, xmax] = box;
      
      // Safety check for coordinates
      if (ymin === undefined || xmin === undefined || ymax === undefined || xmax === undefined) return;

      // Convert 0-1000 to pixels
      const sx = (xmin / 1000) * img.width;
      const sy = (ymin / 1000) * img.height;
      const sWidth = ((xmax - xmin) / 1000) * img.width;
      const sHeight = ((ymax - ymin) / 1000) * img.height;

      // Set canvas size to the cropped size
      canvas.width = sWidth;
      canvas.height = sHeight;

      // Clear and Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
    };
    img.src = src.startsWith('data:') ? src : `data:image/png;base64,${src}`;
  }, [src, box]);

  return <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-sm" />;
};

export const WorksheetRenderer: React.FC<Props> = ({ 
  data, 
  worksheetImageUrl,
  sourceImage, 
  customLogo, 
  customHeaderText,
  onRegenerateImage
}) => {
    
  return (
    <div id="print-area" className="bg-white shadow-xl mx-auto w-full max-w-[210mm] min-h-[297mm] p-6 mb-8 relative">
        {/* Book Style Frame */}
        <div className="w-full h-full min-h-[calc(297mm-48px)] border-[3px] border-gray-800 rounded-3xl p-8 relative flex flex-col">
          
          {/* Decorative Corners */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-4 border-l-4 border-gray-800 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-4 border-r-4 border-gray-800 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-4 border-l-4 border-gray-800 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-4 border-r-4 border-gray-800 rounded-br-lg"></div>

          {/* Header */}
          <div className="pb-6 mb-6 text-center flex flex-col items-center border-b-2 border-dashed border-gray-300">
            {customLogo && (
                <img src={customLogo} alt="School Logo" className="h-28 mb-4 object-contain" />
            )}
            {customHeaderText && (
                <h2 className="text-xl font-bold font-sans text-gray-500 mb-2 uppercase tracking-widest">{customHeaderText}</h2>
            )}
            
            {/* If we have structured data, show title/meta. If image only, we might just show branding */}
            {data && (
                <>
                    <h1 className="text-5xl font-bold font-hand text-gray-900 mb-3">{data.title}</h1>
                    <div className="flex justify-center gap-4 text-base font-hand text-gray-600 font-bold w-full">
                        {data.subject && <span className="px-3 py-1 bg-gray-100 rounded-full">{data.subject}</span>}
                        {data.gradeLevel && <span className="px-3 py-1 bg-gray-100 rounded-full">{data.gradeLevel}</span>}
                    </div>
                </>
            )}
            
            <div className="mt-4 w-full flex justify-end">
                <div className="border-b-2 border-gray-400 w-48 text-right pr-2 text-gray-400 font-hand text-lg">Name</div>
            </div>
          </div>

          {/* CONTENT AREA */}
          
          {/* Case 1: Full Page Generated Image (Nano Banana Mode) */}
          {worksheetImageUrl ? (
             <div className="flex-grow flex items-center justify-center p-4">
                 <img src={worksheetImageUrl} alt="AI Generated Worksheet" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
             </div>
          ) : (
            /* Case 2: Structured Data Layout */
            data && (
                <>
                    <div className="mb-8">
                        <p className="font-hand text-2xl text-gray-800 leading-relaxed text-center">{data.instructions}</p>
                    </div>

                    <div className="space-y-10 flex-grow">
                        {data.sections.map((section, idx) => (
                        <div key={section.id || idx} className="break-inside-avoid">
                            {section.title && (
                                <h3 className="text-3xl font-bold text-gray-800 font-hand mb-6 text-center">
                                    {section.title}
                                </h3>
                            )}
                            
                            <div className="w-full">
                                {renderSectionContent(section, sourceImage, onRegenerateImage)}
                            </div>
                        </div>
                        ))}
                    </div>
                </>
            )
          )}

          {/* Footer */}
          <div className="mt-auto pt-8 text-center text-sm text-gray-400 font-sans border-t border-gray-100">
            {customHeaderText ? customHeaderText : "Created with EduGenius"}
          </div>
      </div>
    </div>
  );
};

const renderSectionContent = (
    section: any, 
    sourceImage?: string | null,
    onRegenerateImage?: (id: string, prompt: string) => void
) => {
    // If it's explicitly an IMAGE type OR has a bounding box + image prompt
    const isImageSection = section.type === SectionType.IMAGE || (section.boundingBox && section.boundingBox.length === 4);
    
    if (isImageSection) {
        const [isRegenerating, setIsRegenerating] = useState(false);

        const handleGenClick = () => {
            if (onRegenerateImage && section.imagePrompt) {
                setIsRegenerating(true);
                onRegenerateImage(section.id, section.imagePrompt);
                setTimeout(() => setIsRegenerating(false), 8000); 
            }
        };

        return (
            <div className="flex flex-col items-center gap-4 group relative w-full my-4">
                {section.content?.text && (
                    <p className="font-hand text-3xl font-bold text-gray-800 mb-2 text-center w-full">{section.content.text}</p>
                )}
                
                <div className="relative w-full flex justify-center p-2">
                    {section.generatedImageUrl ? (
                         <img src={section.generatedImageUrl} alt="Generated illustration" className="max-w-[80%] rounded-xl shadow-lg border-2 border-gray-100" />
                    ) : (
                        sourceImage && section.boundingBox ? (
                            <div className="flex justify-center w-full">
                                <div className="transform scale-110">
                                   <CroppedImage src={sourceImage} box={section.boundingBox} />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-xl text-gray-400 border-2 border-dashed border-gray-300">
                                <span className="text-xl font-hand">Image Placeholder</span>
                            </div>
                        )
                    )}

                    {onRegenerateImage && section.imagePrompt && (
                        <button 
                            onClick={handleGenClick}
                            disabled={isRegenerating}
                            className="no-print absolute top-4 right-4 bg-white hover:bg-gray-50 text-indigo-600 p-3 rounded-full shadow-lg border border-indigo-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                            title="Regenerate this specific image"
                        >
                             {isRegenerating ? (
                                 <Loader2 className="w-5 h-5 animate-spin" />
                             ) : (
                                 <Sparkles className="w-5 h-5" />
                             )}
                        </button>
                    )}
                </div>
                 {section.content?.prompt && (
                    <p className="font-hand text-gray-400 italic text-lg text-center mt-2">{section.content.prompt}</p>
                )}
            </div>
        );
    }

    switch (section.type) {
        case SectionType.MATCHING:
            return (
                <div className="grid grid-cols-2 gap-12 relative my-6">
                    <div className="space-y-8">
                        {section.content.pairs?.map((pair: any, i: number) => (
                            <div key={`l-${i}`} className="p-6 border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center min-h-[100px] font-hand font-bold text-2xl bg-gray-50 text-center">
                                {pair.left}
                            </div>
                        ))}
                    </div>
                    <div className="space-y-8">
                        {section.content.pairs?.map((pair: any, i: number) => (
                            <div key={`r-${i}`} className="p-6 border-4 border-gray-300 rounded-2xl flex items-center justify-center min-h-[100px] font-hand text-2xl shadow-sm text-center">
                                {pair.right}
                            </div>
                        ))}
                    </div>
                </div>
            );
        case SectionType.FILL_BLANK:
            return (
                <div className="space-y-6 font-hand text-2xl leading-loose">
                     {section.content.sentence ? (
                         <div className="p-6 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                             {section.content.sentence.split('___').map((part: string, i: number, arr: string[]) => (
                                 <React.Fragment key={i}>
                                     {part}
                                     {i < arr.length - 1 && (
                                         <span className="inline-block w-48 border-b-4 border-gray-800 mx-2 relative top-1"></span>
                                     )}
                                 </React.Fragment>
                             ))}
                         </div>
                     ) : null}
                </div>
            );
        case SectionType.DRAWING:
            return (
                <div className="border-[6px] border-gray-200 rounded-3xl h-80 bg-white flex flex-col items-center justify-center relative overflow-hidden my-6">
                    <div className="absolute top-6 left-6 text-gray-400 font-hand text-xl">Draw here:</div>
                    <div className="text-center p-8">
                        <p className="text-gray-400 italic font-hand text-2xl">{section.content.prompt}</p>
                    </div>
                </div>
            );
        case SectionType.MATH:
            return (
                <div className="grid grid-cols-2 gap-8 my-6">
                    {section.content.problems?.map((prob: any, i: number) => (
                         <div key={i} className="flex items-center justify-center gap-4 font-hand text-4xl font-bold text-gray-800 p-4 bg-gray-50 rounded-xl">
                             <span>{prob.q}</span>
                             <span>=</span>
                             <div className="w-24 h-16 border-4 border-gray-300 rounded-lg bg-white"></div>
                         </div>
                    ))}
                </div>
            );
        case SectionType.TEXT:
        default:
            return (
                <p className="font-hand text-2xl text-gray-800 leading-relaxed text-center my-4">
                    {section.content.text}
                </p>
            );
    }
}