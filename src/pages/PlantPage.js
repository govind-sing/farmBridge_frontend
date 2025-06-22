import React, { useState } from 'react';
import { identifyPlant, detectDisease } from '../apiAxios';

function PlantPage() {
  const [identifyFile, setIdentifyFile] = useState(null);
  const [diseaseFile, setDiseaseFile] = useState(null);
  const [identifyResult, setIdentifyResult] = useState('');
  const [diseaseResult, setDiseaseResult] = useState('');
  const [organ, setOrgan] = useState('leaf'); // Default organ selection

  const handleIdentifyFileChange = (e) => {
    setIdentifyFile(e.target.files[0]);
    setIdentifyResult(''); // Clear previous result
  };

  const handleDiseaseFileChange = (e) => {
    setDiseaseFile(e.target.files[0]);
    setDiseaseResult(''); // Clear previous result
  };

  const handleIdentify = async () => {
    if (!identifyFile) {
      setIdentifyResult('Please upload an image first');
      return;
    }
    const formData = new FormData();
    formData.append('image', identifyFile);
    formData.append('organ', organ); // Send selected organ
    try {
      const res = await identifyPlant(formData);
      setIdentifyResult(res.data.plantName);
    } catch (err) {
      setIdentifyResult('Error identifying plant');
    }
  };

  const handleDisease = async () => {
    if (!diseaseFile) {
      setDiseaseResult('Please upload an image first');
      return;
    }
    const formData = new FormData();
    formData.append('image', diseaseFile);
    try {
      const res = await detectDisease(formData);
      setDiseaseResult(res.data.disease);
    } catch (err) {
      setDiseaseResult('Error detecting disease');
    }
  };

  // Function to generate Google search URL
  const getGoogleSearchUrl = (result) => {
    if (!result || result.includes('Error') || result === 'No disease detected' || result === 'Please upload an image first') {
      return null;
    }
    // Add "plant" context to the search query
    return `https://www.google.com/search?q=${encodeURIComponent(`${result} plant`)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Plant Identification & Disease Detection
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Identify Plant</h2>
          <input
            type="file"
            onChange={handleIdentifyFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-500 file:text-white hover:file:bg-green-600 mb-4"
          />
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Select Organ:</label>
            <select
              value={organ}
              onChange={(e) => setOrgan(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="leaf">Leaf</option>
              <option value="flower">Flower</option>
              <option value="seed">Seed</option>
              <option value="auto">Other (Auto-detect)</option>
            </select>
          </div>
          <button
            onClick={handleIdentify}
            className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
          >
            Identify Plant
          </button>
          <p className="mt-4 text-gray-600">
            {identifyResult && (
              getGoogleSearchUrl(identifyResult) ? (
                <a
                  href={getGoogleSearchUrl(identifyResult)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {identifyResult}
                </a>
              ) : (
                identifyResult
              )
            )}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Detect Disease</h2>
          <input
            type="file"
            onChange={handleDiseaseFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-500 file:text-white hover:file:bg-green-600 mb-4"
          />
          <button
            onClick={handleDisease}
            className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
          >
            Detect Disease
          </button>
          <p className="mt-4 text-gray-600">
            {diseaseResult && (
              getGoogleSearchUrl(diseaseResult) ? (
                <a
                  href={getGoogleSearchUrl(diseaseResult)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {diseaseResult}
                </a>
              ) : (
                diseaseResult
              )
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PlantPage;