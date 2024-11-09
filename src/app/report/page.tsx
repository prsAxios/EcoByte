// @ts-nocheck


'use client'

import { useState, useCallback, useEffect } from 'react'
import {  MapPin, Upload, CheckCircle, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StandaloneSearchBox,  useJsApiLoader } from '@react-google-maps/api'
import { Libraries } from '@react-google-maps/api';
import { createUser, getUserByEmail, createReport, getRecentReports } from '@/utils/db/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast'

const geminiApiKey = process.env.GEMINI_API_KEY;
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const libraries: Libraries = ['places'];

export default function ReportPage() {
  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(null);
  const router = useRouter();

  const [reports, setReports] = useState<Array<{
    id: number;
    location: string;
    foodType: string;
    expiryDate: string;
    createdAt: string;

  }>>([]);

  const [newReport, setNewReport] = useState({
    location: '',
    foodtype: '',
    expirydate: '',
  })

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failure'>('idle')
  const [verificationResult, setVerificationResult] = useState<{
    foodType: string;
    expiryDate: string;
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey!,
    libraries: libraries
  });

  const onLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);

  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        setNewReport(prev => ({
          ...prev,
          location: place.formatted_address || '',
        }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewReport({ ...newReport, [name]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // const handleVerify = async () => {
  //   if (!file) return

  //   setVerificationStatus('verifying')
    
  //   try {
  //     const genAI = new GoogleGenerativeAI(geminiApiKey!);
  //     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  //     const base64Data = await readFileAsBase64(file);

  //     const imageParts = [
  //       {
  //         inlineData: {
  //           data: base64Data.split(',')[1],
  //           mimeType: file.type,
  //         },
  //       },
  //     ];

  //     const prompt = `You are an expert in Food management and recycling. Analyze this image and provide:
  //     1. The type of food (e.g., fruit, vegetable, dairy, grain). If the food type cannot be identified, respond with "unknown".
  //     2. The estimated expiration date in 'YYYY-MM-DD' format. If the date cannot be estimated, respond with "unknown".
  //     3. Your confidence level in this assessment as a percentage (e.g., 90 for 90%).

  //     Ensure that:
  //     - If the food type cannot be identified, return "unknown".
  //     - If the expiry date cannot be determined, return "unknown".
  //     - Provide the confidence level as an integer percentage (from 0 to 100).

  //     Respond in JSON format like this:
  //     {
  //       "foodType": "type of food",
  //       "expiryDate": "estimated expiration date",
  //       "confidence": confidence level as an integer between 0 and 100
  //     }`;


  //     const result = await model.generateContent([prompt, ...imageParts]);
  //     console.log(result);
  //     const response = await result.response;
  //     const text =  response.text();
  //     const cleanText =text.trim();
      
  //     try {
        
  //       const parsedResult = JSON.parse(cleanText);
        
  //       if (parsedResult.foodType && parsedResult.expiryDate && parsedResult.confidence) {
  //         setVerificationResult(parsedResult);
  //         setVerificationStatus('success');
  //         setNewReport({
  //           ...newReport,
  //           type: parsedResult.foodType,
  //           amount: parsedResult.expiryDate
  //         });
  //       } else {
  //         console.error('Invalid verification result:', parsedResult);
  //         setVerificationStatus('failure');
  //       }
  //     } catch (error) {
  //       console.error('Failed to parse JSON response:', text);
  //       setVerificationStatus('failure');
  //     }
  //   } catch (error) {
  //     console.error('Error verifying waste:', error);
  //     setVerificationStatus('failure');
  //   }
  // }

  const handleVerify = async () => {
    if (!file) return;
  
    setVerificationStatus('verifying');
  
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      // Read the file as base64 and prepare image parts
      const base64Data = await readFileAsBase64(file);
      const imageParts = [
        {
          inlineData: {
            data: base64Data.split(',')[1], // remove data URI prefix
            mimeType: file.type,
          },
        },
      ];
  
      const prompt = `You are an expert in Food management and recycling. Analyze this image and provide:
      1. The type of food (e.g., fruit, vegetable, dairy, grain). If the food type cannot be identified, respond with "unknown".
      2. The estimated expiration date in 'YYYY-MM-DD' format. If the date cannot be estimated, respond with "unknown".
      3. Your confidence level in this assessment as a percentage (e.g., 90 for 90%).
  
      Ensure that:
      - If the food type cannot be identified, return "unknown".
      - If the expiry date cannot be determined, return "unknown".
      - Provide the confidence level as an integer percentage (from 0 to 100).
  
      Respond in JSON format like this:
      {
        "foodType": "type of food",
        "expiryDate": "estimated expiration date",
        "confidence": confidence level as an integer between 0 and 100
      }`;
  
      // Generate content using the model
      const result = await model.generateContent([prompt, ...imageParts]);
      console.log(result);
  
      const response = await result.response;
      // const text = await response.text();  // Await text() to get the actual content
      // const cleanText = text.trim();
      const rawText = await response.text();
  
      try {
        // Parse the clean response text as JSON
        const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : rawText;
  
        // Parse JSON
        const parsedResult = JSON.parse(jsonText);
        console.log('Parsed result:', parsedResult);
        // const parsedResult = JSON.parse(cleanText);
  
        // Validate the parsed result
        if (parsedResult.foodType && parsedResult.expiryDate && parsedResult.confidence) {
          setVerificationResult(parsedResult);
          setVerificationStatus('success');
          setNewReport({
            ...newReport,
            type: parsedResult.foodType,
            amount: parsedResult.expiryDate,
          });
        } else {
          console.error('Invalid verification result:', parsedResult);
          setVerificationStatus('failure');
        }
      } catch (error) {
        console.error('Failed to parse JSON response:', cleanText);
        setVerificationStatus('failure');
      }
    } catch (error) {
      console.error('Error verifying waste:', error);
      setVerificationStatus('failure');
    }
  };
  
  
  
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationStatus !== 'success' || !user) {
      toast.error('Please verify the waste before submitting or log in.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const report = await createReport(
        user.id,
        newReport.location,
        newReport.type,
        newReport.amount,
        preview || undefined,

        verificationResult ? JSON.stringify(verificationResult) : undefined
      ) as any;
      
      const formattedReport = {
        id: report.id,
        location: report.location,
        foodType: report.foodType,
        expiryDate: report.expiryDate,
        createdAt: report.createdAt.toISOString().split('T')[0]
      };
      
      setReports([formattedReport, ...reports]);
      setNewReport({ location: '', type: '', amount: ''});
      setFile(null);
      setPreview(null);
      setVerificationStatus('idle');
      setVerificationResult(null);
      

      toast.success(`Report submitted successfully! You've earned points for reporting waste.`);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        let user = await getUserByEmail(email);
        if (!user) {
          user = await createUser(email, 'Anonymous User');
        }
        setUser(user);
        
        const recentReports = await getRecentReports();
        const formattedReports = recentReports.map(report => ({
          ...report,
          createdAt: report.createdAt.toISOString().split('T')[0]
        }));
        setReports(formattedReports);
      } else {
        router.push('/login'); 
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Report waste</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg mb-12">
        <div className="mb-8">
          <label htmlFor="waste-image" className="block text-lg font-medium text-gray-700 mb-2">
            Upload Waste Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-green-500 transition-colors duration-300">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="waste-image"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500"
                >
                  <span>Upload a file</span>
                  <input id="waste-image" name="waste-image" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
        
        {preview && (
          <div className="mt-4 mb-8">
            <img src={preview} alt="Waste preview" className="max-w-full h-auto rounded-xl shadow-md" />
          </div>
        )}
        
        <Button 
          type="button" 
          onClick={handleVerify} 
          className="w-full mb-8 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-xl transition-colors duration-300" 
          disabled={!file || verificationStatus === 'verifying'}
        >
          {verificationStatus === 'verifying' ? (
            <>
              <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Verifying...
            </>
          ) : 'Verify Waste'}
        </Button>

        {verificationStatus === 'success' && verificationResult && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 rounded-r-xl">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-800">Verification Successful</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Waste Type: {verificationResult.foodType}</p>
                  <p>Quantity: {verificationResult.expiryDate}</p>
                  <p>Confidence: {(verificationResult.confidence * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            {isLoaded ? (
              <StandaloneSearchBox
                onLoad={onLoad}
                onPlacesChanged={onPlacesChanged}
              >
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newReport.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                  placeholder="Enter waste location"
                />
              </StandaloneSearchBox>
            ) : (
              <input
                type="text"
                id="location"
                name="location"
                value={newReport.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                placeholder="Enter waste location"
              />
            )}
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
            <input
              type="text"
              id="type"
              name="type"
              value={newReport.type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 bg-gray-100"
              placeholder="Verified waste type"
              readOnly
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={newReport.amount}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 bg-gray-100"
              placeholder="Verified amount"
              readOnly
            />
          </div>



        </div>
        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg rounded-xl transition-colors duration-300 flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Submitting...
            </>
          ) : 'Submit Report'}
        </Button>
      </form>

      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Recent Food Reports</h2>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <MapPin className="inline-block w-4 h-4 mr-2 text-green-500" />
                    {report.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.foodType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.expiryDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


