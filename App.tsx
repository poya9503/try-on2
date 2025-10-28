
import React, { useState, useMemo } from 'react';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import { generateTryOnImage, generateFinalImage } from './services/geminiService';
import { MODEL_TYPES } from './constants';
import { ModelType } from './types';
import type { ImageFile } from './types';

const App: React.FC = () => {
  const [characterImage, setCharacterImage] = useState<ImageFile | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageFile | null>(null);
  const [picture1, setPicture1] = useState<string | null>(null);
  const [picture2, setPicture2] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const characterImageUrl = useMemo(() => characterImage ? `data:${characterImage.mimeType};base64,${characterImage.base64}` : null, [characterImage]);
  const clothingImageUrl = useMemo(() => clothingImage ? `data:${clothingImage.mimeType};base64,${clothingImage.base64}` : null, [clothingImage]);

  const handleGenerateTryOn = async () => {
    if (!characterImage || !clothingImage) return;
    setLoadingMessage('Generating virtual try-on...');
    setError(null);
    setPicture1(null);
    setPicture2(null);
    setSelectedModel(null);
    try {
      const result = await generateTryOnImage(characterImage, clothingImage);
      setPicture1(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoadingMessage('');
    }
  };
  
  const dataUrlToImageFile = (dataUrl: string): ImageFile => {
    const [header, base64] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return { base64, mimeType };
  }

  const handleGenerateFinal = async () => {
    if (!picture1 || !selectedModel) return;
    setLoadingMessage('Applying model features...');
    setError(null);
    setPicture2(null);
    try {
      const tryOnImageFile = dataUrlToImageFile(picture1);
      const result = await generateFinalImage(tryOnImageFile, selectedModel);
      setPicture2(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoadingMessage('');
    }
  };
  
  const CharacterIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  );

  const ClothingIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
  );

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 bg-gradient-to-br from-gray-900 via-indigo-900/40 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            AI Virtual Stylist
          </h1>
          <p className="mt-2 text-lg text-gray-400">Upload, Generate, and Stylize with AI</p>
        </header>

        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageUploader title="Upload Character" onImageUpload={setCharacterImage} imageUrl={characterImageUrl} icon={<CharacterIcon />} />
            <ImageUploader title="Upload Clothing" onImageUpload={setClothingImage} imageUrl={clothingImageUrl} icon={<ClothingIcon />} />
        </main>
        
        <div className="text-center my-8">
            <button
                onClick={handleGenerateTryOn}
                disabled={!characterImage || !clothingImage || !!loadingMessage}
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-600/30"
            >
                Generate Try-On
            </button>
        </div>

        {(picture1 || loadingMessage) && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Picture 1 and Model Selector */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-700 relative">
                    <h3 className="text-xl font-semibold text-white mb-4">Step 1: Generated Try-On</h3>
                    <div className="w-full h-80 bg-gray-900/50 rounded-lg flex items-center justify-center relative">
                        {loadingMessage.includes('try-on') && <Loader message={loadingMessage} />}
                        {picture1 && <img src={picture1} alt="Generated Try-On" className="w-full h-full object-contain rounded-lg"/>}
                    </div>
                    {picture1 && (
                         <div className="mt-6">
                            <h4 className="text-lg font-medium text-white mb-3">Step 2: Select Model Type</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {MODEL_TYPES.map(model => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModel(model.id)}
                                        className={`py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${selectedModel === model.id ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    >
                                        {model.name}
                                    </button>
                                ))}
                            </div>
                            <div className="text-center mt-6">
                                <button
                                    onClick={handleGenerateFinal}
                                    disabled={!selectedModel || !!loadingMessage}
                                    className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/30"
                                >
                                    Generate Final Image
                                </button>
                            </div>
                         </div>
                    )}
                </div>

                {/* Picture 2 Display */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-700 relative">
                    <h3 className="text-xl font-semibold text-white mb-4">Step 3: Final Image</h3>
                     <div className="w-full h-80 bg-gray-900/50 rounded-lg flex items-center justify-center relative min-h-[30rem]">
                         {loadingMessage.includes('model') && <Loader message={loadingMessage} />}
                        {picture2 && <img src={picture2} alt="Final Generated" className="w-full h-full object-contain rounded-lg"/>}
                         {!picture2 && !loadingMessage.includes('model') && <p className="text-gray-400">Final result will appear here</p>}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
