import React, { useState } from 'react';
import { generateWorksheetImage, generateExamFromHandwriting } from './services/geminiService';
import { generateExamDocx } from './services/docxService';
import { FileUpload } from './components/FileUpload';
import { WorksheetRenderer } from './components/WorksheetRenderer';
import { ExamRenderer } from './components/ExamRenderer';
import { SearchTool } from './components/SearchTool';
import { AppMode, ExamData } from './types';
import { ArrowLeft, Printer, GraduationCap, Baby, Sparkles, Settings, Wand2, Image as ImageIcon, X, PenTool, Download, FileText } from 'lucide-react';

interface BrandingPanelProps {
    customHeaderText: string;
    setCustomHeaderText: (val: string) => void;
    customLogo: string | null;
    setCustomLogo: (val: string | null) => void;
    handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BrandingPanel: React.FC<BrandingPanelProps> = ({
    customHeaderText,
    setCustomHeaderText,
    customLogo,
    setCustomLogo,
    handleLogoChange
}) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6 no-print">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
        <Settings className="w-5 h-5 mr-2 text-gray-600" />
        School Branding
        </h3>
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">School Name / Header</label>
                <input 
                    type="text" 
                    value={customHeaderText} 
                    onChange={(e) => setCustomHeaderText(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg text-base text-gray-800 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder-gray-400" 
                    placeholder="Type School Name Here..."
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Logo</label>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
            </div>
            {customLogo && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-sm text-green-700 font-medium flex items-center">✓ Logo ready</span>
                    <button onClick={() => setCustomLogo(null)} className="text-sm text-red-500 hover:text-red-700 font-medium underline ml-auto">Remove</button>
                </div>
            )}
        </div>
    </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  
  // Data States
  const [worksheetImageUrl, setWorksheetImageUrl] = useState<string | null>(null);
  const [examData, setExamData] = useState<ExamData | null>(null);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  
  // Visual Studio States
  const [visualPrompt, setVisualPrompt] = useState("");
  const [pendingFile, setPendingFile] = useState<{base64: string, mimeType: string} | null>(null);
  
  // Branding State
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [customHeaderText, setCustomHeaderText] = useState<string>("");

  const handleWorksheetUpload = async (base64: string, mimeType: string) => {
    // In Visual mode, we store the file as pending for the generation request
    setPendingFile({ base64, mimeType });
    setSourceImage(`data:${mimeType};base64,${base64}`);
    setError(null);
  };

  const handleGenerateVisual = async () => {
      if (!visualPrompt.trim() && !pendingFile) {
          setError("Please enter instructions or upload a reference image.");
          return;
      }
      
      setLoading(true);
      setError(null);
      setWorksheetImageUrl(null);

      try {
          const imageUrl = await generateWorksheetImage(pendingFile?.base64, pendingFile?.mimeType, visualPrompt);
          setWorksheetImageUrl(imageUrl);
      } catch (e: any) {
          setError(e.message || "Generation failed. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const clearPendingFile = () => {
      setPendingFile(null);
      setSourceImage(null);
  };

  const handleExamUpload = async (base64: string, mimeType: string) => {
    setLoading(true);
    setError(null);
    try {
        const data = await generateExamFromHandwriting(base64, mimeType);
        setExamData(data);
    } catch (e: any) {
        const msg = e.message || "Failed to transcribe exam. Please ensure handwriting is legible.";
        setError(msg);
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
         setCustomLogo(event.target?.result as string);
      }
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setWorksheetImageUrl(null);
    setExamData(null);
    setError(null);
    setSourceImage(null);
    setPendingFile(null);
    setVisualPrompt("");
  };

  const goHome = () => {
    reset();
    setMode(AppMode.HOME);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    if (!worksheetImageUrl) return;
    const link = document.createElement('a');
    link.href = worksheetImageUrl;
    link.download = `worksheet-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDocx = async () => {
    if (!examData) return;
    try {
      const blob = await generateExamDocx(examData, customHeaderText);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${examData.subject}-Exam-${Date.now()}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Docx generation failed", e);
      setError("Failed to generate Word document.");
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50 pb-20">
      
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
            <div className="bg-primary text-white p-2 rounded-lg">
                <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">EduGenius</span>
          </div>
          {mode !== AppMode.HOME && (
             <button onClick={goHome} className="text-sm text-gray-500 hover:text-gray-900 flex items-center">
                 <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
             </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Error Display */}
        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center justify-center animate-pulse">
                {error}
            </div>
        )}

        {/* HOME SCREEN */}
        {mode === AppMode.HOME && (
          <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center h-[70vh]">
            <div 
                onClick={() => setMode(AppMode.MONTESSORI)}
                className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:border-montessori transition-all group"
            >
                <div className="bg-yellow-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                    <Baby className="w-12 h-12 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Montessori</h2>
                <p className="text-gray-500 text-center max-w-xs">Create fresh, engaging worksheets from text prompts or existing images.</p>
                <button className="mt-8 px-6 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Start Creating</button>
            </div>

            <div 
                onClick={() => setMode(AppMode.SECONDARY)}
                className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:border-secondarySchool transition-all group"
            >
                <div className="bg-blue-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Secondary School</h2>
                <p className="text-gray-500 text-center max-w-xs">Digitize handwritten exam papers into professional, academic documents.</p>
                 <button className="mt-8 px-6 py-2 bg-blue-500 text-white font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Start Creating</button>
            </div>
          </div>
        )}

        {/* MONTESSORI MODE */}
        {mode === AppMode.MONTESSORI && (
          <div className="flex flex-col lg:flex-row gap-8">
             <div className="lg:w-1/3 space-y-6 no-print">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Baby className="w-6 h-6 text-montessori" />
                        Montessori Creator
                    </h2>

                    {/* VISUAL STUDIO UI */}
                    <div className="space-y-5">
                        <p className="text-sm text-gray-500 mb-2">
                            Describe the worksheet you want to create. You can optionally upload an image as a style reference.
                        </p>
                        
                        {/* Prompt Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                                <PenTool className="w-4 h-4" /> Instructions / Prompt
                            </label>
                            <textarea
                                value={visualPrompt}
                                onChange={(e) => setVisualPrompt(e.target.value)}
                                placeholder="e.g. Create a kindergarten math worksheet with cute space rockets to count."
                                className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[120px] shadow-sm transition-all"
                            />
                        </div>

                        {/* Optional File Upload */}
                        {!pendingFile ? (
                            <FileUpload 
                                onFileSelect={handleWorksheetUpload} 
                                isLoading={loading} 
                                label="Reference Image (Optional)" 
                            />
                        ) : (
                            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-2 text-sm text-indigo-700 font-medium truncate">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>Image attached for reference</span>
                                </div>
                                <button 
                                    onClick={clearPendingFile}
                                    className="p-1 hover:bg-white rounded-full text-indigo-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerateVisual}
                            disabled={loading || (!visualPrompt.trim() && !pendingFile)}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? (
                                <>
                                    <Wand2 className="w-6 h-6 animate-spin" /> Enhancing & Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-6 h-6" /> Generate Worksheet
                                </>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Search Tool (Only show if no result yet) */}
                {!worksheetImageUrl && <SearchTool onImageFound={() => {}} />}

                <BrandingPanel 
                    customHeaderText={customHeaderText}
                    setCustomHeaderText={setCustomHeaderText}
                    customLogo={customLogo}
                    setCustomLogo={setCustomLogo}
                    handleLogoChange={handleLogoChange}
                />
                
                {worksheetImageUrl && (
                    <div className="bg-indigo-900 text-white p-6 rounded-xl mt-6">
                        <h3 className="font-bold mb-2 text-lg">Actions</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleDownloadImage} className="flex items-center justify-center w-full py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors shadow-lg">
                                <Download className="w-6 h-6 mr-2" /> Download Image
                            </button>
                            <button onClick={reset} className="flex items-center justify-center w-full py-4 border border-indigo-500 bg-indigo-800 text-indigo-100 rounded-lg hover:bg-indigo-700 transition-colors">
                                Create Another
                            </button>
                        </div>
                    </div>
                )}
             </div>

             <div className="lg:w-2/3 print-container">
                {worksheetImageUrl ? (
                    <WorksheetRenderer 
                        data={null}
                        worksheetImageUrl={worksheetImageUrl}
                        sourceImage={sourceImage} 
                        customLogo={customLogo}
                        customHeaderText={customHeaderText}
                    />
                ) : (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                        <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg">Your AI-enhanced worksheet will appear here</p>
                    </div>
                )}
             </div>
          </div>
        )}

        {/* SECONDARY MODE */}
        {mode === AppMode.SECONDARY && (
          <div className="flex flex-col lg:flex-row gap-8">
             <div className="lg:w-1/3 space-y-6 no-print">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-secondarySchool" />
                        Exam Digitizer
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">Upload a handwritten exam paper to convert it into a professional format.</p>
                    <FileUpload onFileSelect={handleExamUpload} isLoading={loading} label="Upload Handwritten Exam" />
                </div>

                <BrandingPanel 
                    customHeaderText={customHeaderText}
                    setCustomHeaderText={setCustomHeaderText}
                    customLogo={customLogo}
                    setCustomLogo={setCustomLogo}
                    handleLogoChange={handleLogoChange}
                />

                {examData && (
                    <div className="bg-gray-900 text-white p-6 rounded-xl mt-6">
                        <h3 className="font-bold mb-2">Actions</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleDownloadDocx} className="flex items-center justify-center w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md">
                                <FileText className="w-5 h-5 mr-2" /> Download Word Doc (.docx)
                            </button>
                            <button onClick={reset} className="flex items-center justify-center w-full py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">
                                Digitize Another
                            </button>
                        </div>
                    </div>
                )}
             </div>

             <div className="lg:w-2/3 print-container">
                {examData ? (
                    <ExamRenderer 
                        data={examData} 
                        customLogo={customLogo}
                        customHeaderText={customHeaderText}
                    />
                ) : (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                        <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                        <p>Your digital exam paper will appear here</p>
                    </div>
                )}
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;