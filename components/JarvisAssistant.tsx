// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { Mic, MicOff, Activity, X } from 'lucide-react';

// const OPENROUTER_API_KEY = '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';
// const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// const SYSTEM_INSTRUCTION = `You are Jarvis, a helpful voice assistant for an IoT Data Manager application. You can:
// - Open files by name (respond with JSON: {"action": "open_file", "filename": "name"})
// - Close files (respond with JSON: {"action": "close_file"})
// - Read file content (respond with JSON: {"action": "get_content"})
// - List files (respond with JSON: {"action": "list_files"})
// - Rename files (respond with JSON: {"action": "rename_file", "old_name": "current name", "new_name": "new name"})
// - Delete files (respond with JSON: {"action": "delete_file", "filename": "name"})

// When users ask to perform these actions, respond with the JSON command followed by a natural language confirmation.
// For rename operations, extract both the current filename and the new desired name.
// For delete operations, ask for confirmation if the user hasn't explicitly confirmed.
// For other queries, respond naturally and helpfully.`;

// interface FileItem {
//   id: string;
//   name: string;
//   type: string;
//   content?: string;
//   url?: string;
// }

// interface JarvisProps {
//   files: FileItem[];
//   activeFile: FileItem | null;
//   onOpenFile: (file: FileItem) => void;
//   onCloseFile: () => void;
//   onRenameFile?: (file: FileItem, newName: string) => void;
//   onDeleteFile?: (file: FileItem) => void;
// }

// // File Preview Modal Component
// const FilePreviewModal: React.FC<{ file: FileItem; onClose: () => void }> = ({ file, onClose }) => {
//   const isImage = file.type?.toLowerCase().includes('png') || file.type?.toLowerCase().includes('jpg') || file.type?.toLowerCase().includes('jpeg') || file.type?.toLowerCase().includes('image');
//   const isPDF = file.type?.toLowerCase().includes('pdf');
//   const isText = file.type?.toLowerCase().includes('csv') || file.type?.toLowerCase().includes('txt') || file.type?.toLowerCase().includes('json');

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
//         <div className="flex items-center justify-between p-6 border-b border-slate-200">
//           <div>
//             <h3 className="text-xl font-semibold text-slate-900">{file.name}</h3>
//             <p className="text-sm text-slate-500 mt-1">{file.type}</p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//             aria-label="Close preview"
//           >
//             <X className="w-5 h-5 text-slate-500" />
//           </button>
//         </div>

//         <div className="flex-1 overflow-auto p-6">
//           {isImage && (
//             <div className="flex items-center justify-center">
//               <img 
//                 src={file.url} 
//                 alt={file.name}
//                 className="max-w-full h-auto rounded-lg shadow-lg"
//               />
//             </div>
//           )}

//           {isPDF && (
//             <iframe
//               src={file.url}
//               className="w-full h-[600px] rounded-lg border border-slate-200"
//               title={file.name}
//             />
//           )}

//           {isText && file.content && (
//             <pre className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto text-sm font-mono text-slate-800 whitespace-pre-wrap">
//               {file.content}
//             </pre>
//           )}

//           {isText && !file.content && (
//             <div className="text-center py-8 text-slate-500">
//               <p>Content not available for preview</p>
//               <a 
//                 href={file.url} 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:underline mt-2 inline-block"
//               >
//                 Open in new tab
//               </a>
//             </div>
//           )}

//           {!isImage && !isPDF && !isText && (
//             <div className="text-center py-8 text-slate-500">
//               <p>Preview not available for this file type</p>
//               <a 
//                 href={file.url} 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:underline mt-2 inline-block"
//               >
//                 Download file
//               </a>
//             </div>
//           )}
//         </div>

//         <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-200">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
//           >
//             Close
//           </button>
//           <a
//             href={file.url}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//           >
//             Open in New Tab
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// const JarvisAssistant: React.FC<JarvisProps> = ({ 
//   files, 
//   activeFile, 
//   onOpenFile, 
//   onCloseFile,
//   onRenameFile,
//   onDeleteFile 
// }) => {
//   const [isActive, setIsActive] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [volume, setVolume] = useState(0);
//   const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

//   const recognitionRef = useRef<any>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const analyserRef = useRef<AnalyserNode | null>(null);
//   const animationFrameRef = useRef<number | null>(null);
//   const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
//   const isActiveRef = useRef(false);

//   const filesRef = useRef(files);
//   const activeFileRef = useRef(activeFile);
//   const onRenameFileRef = useRef(onRenameFile);
//   const onDeleteFileRef = useRef(onDeleteFile);

//   useEffect(() => {
//     filesRef.current = files || [];
//     activeFileRef.current = activeFile;
//     onRenameFileRef.current = onRenameFile;
//     onDeleteFileRef.current = onDeleteFile;
//     console.log('📁 Files updated:', (files || []).length, 'files available');
//     console.log('📄 Active file:', activeFile?.name || 'none');
//   }, [files, activeFile, onRenameFile, onDeleteFile]);

//   useEffect(() => {
//     isActiveRef.current = isActive;
//   }, [isActive]);

//   useEffect(() => {
//     if ('speechSynthesis' in window) {
//       const loadVoices = () => {
//         const voices = window.speechSynthesis.getVoices();
//         console.log('🔊 Available voices:', voices.length);
//       };
      
//       loadVoices();
//       window.speechSynthesis.onvoiceschanged = loadVoices;
//     }

//     return () => {
//       console.log('🧹 Cleaning up Jarvis...');
//       stopJarvis();
//     };
//   }, []);

//   const analyzeAudio = useCallback(() => {
//     if (!analyserRef.current || !isListening) return;

//     const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
//     analyserRef.current.getByteFrequencyData(dataArray);
    
//     const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
//     const normalizedVolume = Math.min(average / 128, 1);
//     setVolume(normalizedVolume);

//     animationFrameRef.current = requestAnimationFrame(analyzeAudio);
//   }, [isListening]);

//   const speak = useCallback((text: string) => {
//     console.log('🗣️ Speaking:', text);
//     return new Promise<void>((resolve) => {
//       if ('speechSynthesis' in window) {
//         window.speechSynthesis.cancel();
        
//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.rate = 1.1;
//         utterance.pitch = 1;
//         utterance.volume = 1;
        
//         const voices = window.speechSynthesis.getVoices();
//         const preferredVoice = voices.find(v => 
//           v.name.includes('Google') || 
//           v.name.includes('Premium') ||
//           v.name.includes('Enhanced') ||
//           v.lang.includes('en')
//         );
//         if (preferredVoice) {
//           utterance.voice = preferredVoice;
//         }

//         utterance.onstart = () => {
//           setIsSpeaking(true);
//         };
//         utterance.onend = () => {
//           setIsSpeaking(false);
//           resolve();
//         };
//         utterance.onerror = (event) => {
//           console.error('❌ Speech error:', event);
//           setIsSpeaking(false);
//           resolve();
//         };

//         synthRef.current = utterance;
//         window.speechSynthesis.speak(utterance);
//       } else {
//         console.warn('⚠️ Speech synthesis not available');
//         resolve();
//       }
//     });
//   }, []);

//   const executeAction = useCallback((response: string) => {
//     console.log('🔍 Checking for actions in response:', response);
//     try {
//       const jsonMatch = response.match(/\{[^}]+\}/);
//       if (!jsonMatch) {
//         console.log('ℹ️ No action found in response');
//         return null;
//       }

//       const action = JSON.parse(jsonMatch[0]);
//       console.log('⚡ Executing action:', action);
      
//       if (action.action === 'open_file') {
//         const query = action.filename.toLowerCase();
//         const filesList = filesRef.current || [];
//         const match = filesList.find(f => 
//           f.name.toLowerCase().includes(query)
//         );
//         if (match) {
//           console.log('✅ Found file:', match.name);
//           setPreviewFile(match);
//           onOpenFile(match);
//           return `Opening preview for ${match.name}`;
//         }
//         return "File not found";
//       } 
      
//       else if (action.action === 'close_file') {
//         setPreviewFile(null);
//         onCloseFile();
//         return "File closed";
//       } 
      
//       else if (action.action === 'rename_file') {
//         const oldQuery = action.old_name.toLowerCase();
//         const newName = action.new_name;
//         const filesList = filesRef.current || [];
//         const match = filesList.find(f => 
//           f.name.toLowerCase().includes(oldQuery)
//         );
        
//         if (match && onRenameFileRef.current) {
//           console.log('✏️ Renaming file:', match.name, 'to', newName);
//           onRenameFileRef.current(match, newName);
//           return `Renamed ${match.name} to ${newName}`;
//         } else if (!match) {
//           return "File not found for renaming";
//         } else {
//           return "Rename functionality not available";
//         }
//       }
      
//       else if (action.action === 'delete_file') {
//         const query = action.filename.toLowerCase();
//         const filesList = filesRef.current || [];
//         const match = filesList.find(f => 
//           f.name.toLowerCase().includes(query)
//         );
        
//         if (match && onDeleteFileRef.current) {
//           console.log('🗑️ Deleting file:', match.name);
//           onDeleteFileRef.current(match);
//           if (previewFile?.id === match.id) {
//             setPreviewFile(null);
//           }
//           return `Deleted ${match.name}`;
//         } else if (!match) {
//           return "File not found for deletion";
//         } else {
//           return "Delete functionality not available";
//         }
//       }
      
//       else if (action.action === 'get_content') {
//         if (activeFileRef.current?.content) {
//           const content = activeFileRef.current.content.substring(0, 200);
//           return `The file contains: ${content}...`;
//         }
//         return "No file is currently open or content is not available";
//       } 
      
//       else if (action.action === 'list_files') {
//         const filesList = filesRef.current || [];
//         const list = filesList.map(f => f.name).join(", ");
//         return `Available files: ${list}`;
//       }
//     } catch (e) {
//       console.error('❌ Error executing action:', e);
//       return null;
//     }
//   }, [onOpenFile, onCloseFile, previewFile]);

//   const processCommand = useCallback(async (transcript: string) => {
//     console.log('🎯 Processing command:', transcript);
//     setIsProcessing(true);
    
//     try {
//       console.log('📡 Sending to OpenRouter API...');
      
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
//       const response = await fetch(OPENROUTER_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
//           'HTTP-Referer': window.location.origin,
//           'X-Title': 'IoT Data Manager - Jarvis'
//         },
//         body: JSON.stringify({
//           model: 'google/gemma-2-27b-it',
//           messages: [
//             { role: 'system', content: SYSTEM_INSTRUCTION },
//             { 
//               role: 'user', 
//               content: `User command: "${transcript}"\nCurrent files: ${(filesRef.current || []).map(f => f.name).join(', ')}\nActive file: ${activeFileRef.current?.name || 'none'}` 
//             }
//           ],
//           temperature: 0.4,
//           max_tokens: 500
//         }),
//         signal: controller.signal
//       });

//       clearTimeout(timeoutId);

//       console.log('📥 Response status:', response.status);
//       console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('❌ API Error Response:', errorText);
//         throw new Error(`API request failed with status ${response.status}`);
//       }

//       // Try to get the response text first to see what we're working with
//       const responseText = await response.text();
//       console.log('📦 Raw response:', responseText.substring(0, 500));
      
//       let data;
//       try {
//         data = JSON.parse(responseText);
//       } catch (parseError) {
//         console.error('❌ JSON Parse Error:', parseError);
//         console.error('Response that failed to parse:', responseText);
//         throw new Error('Invalid JSON response from API');
//       }

//       const aiResponse = data.choices?.[0]?.message?.content || "I didn't understand that.";
//       console.log('🤖 AI Response:', aiResponse);
      
//       const actionResult = executeAction(aiResponse);
      
//       const textToSpeak = actionResult || aiResponse.replace(/\{[^}]+\}/, '').trim();
//       await speak(textToSpeak);
      
//     } catch (error) {
//       console.error('❌ Error processing command:', error);
      
//       if (error instanceof Error) {
//         console.error('Error name:', error.name);
//         console.error('Error message:', error.message);
//         console.error('Error stack:', error.stack);
        
//         if (error.name === 'AbortError') {
//           await speak("Sorry, the request took too long and timed out.");
//         } else {
//           await speak("Sorry, I encountered an error processing your request. Please try again.");
//         }
//       } else {
//         await speak("Sorry, an unexpected error occurred.");
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [executeAction, speak]);

//   const startListening = useCallback(async () => {
//     console.log('🎬 Starting Jarvis...');
    
//     const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
//     if (!SpeechRecognition) {
//       console.error('❌ Speech recognition not supported');
//       alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
//       return;
//     }

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
//       const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
//       const analyser = audioContext.createAnalyser();
//       const source = audioContext.createMediaStreamSource(stream);
      
//       analyser.fftSize = 256;
//       source.connect(analyser);
      
//       audioContextRef.current = audioContext;
//       analyserRef.current = analyser;

//       const recognition = new SpeechRecognition();
      
//       recognition.continuous = true;
//       recognition.interimResults = false;
//       recognition.lang = 'en-US';
//       recognition.maxAlternatives = 1;

//       recognition.onstart = () => {
//         console.log('✅ Speech recognition started');
//         setIsListening(true);
//         analyzeAudio();
//       };

//       recognition.onresult = (event: any) => {
//         const result = event.results[event.results.length - 1];
//         const transcript = result[0].transcript;
//         console.log('🎯 Heard:', transcript);
        
//         if (isActiveRef.current) {
//           processCommand(transcript);
//         }
//       };

//       recognition.onerror = (event: any) => {
//         console.error('❌ Speech recognition error:', event.error);
        
//         if (event.error === 'no-speech') {
//           setTimeout(() => {
//             if (isActiveRef.current) {
//               try {
//                 recognition.start();
//               } catch (e) {
//                 console.error('❌ Failed to restart:', e);
//               }
//             }
//           }, 100);
//         }
//       };

//       recognition.onend = () => {
//         if (isActiveRef.current && !isProcessing) {
//           setTimeout(() => {
//             if (isActiveRef.current) {
//               try {
//                 recognition.start();
//               } catch (e) {
//                 console.error('❌ Failed to restart:', e);
//               }
//             }
//           }, 100);
//         }
//       };

//       recognitionRef.current = recognition;
//       recognition.start();
      
//       await speak("Jarvis activated. I can now open, close, rename, delete, and list your files. How can I help you?");
      
//     } catch (error) {
//       console.error('❌ Error starting speech recognition:', error);
//       alert('Failed to access microphone. Please grant microphone permissions and try again.');
//       setIsActive(false);
//     }
//   }, [analyzeAudio, processCommand, speak, isProcessing]);

//   const stopJarvis = useCallback(() => {
//     console.log('🛑 Stopping Jarvis...');
    
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//       } catch (e) {
//         console.error('Error stopping recognition:', e);
//       }
//       recognitionRef.current = null;
//     }

//     if (animationFrameRef.current) {
//       cancelAnimationFrame(animationFrameRef.current);
//       animationFrameRef.current = null;
//     }

//     if (audioContextRef.current) {
//       try {
//         audioContextRef.current.close();
//       } catch (e) {
//         console.error('Error closing audio context:', e);
//       }
//       audioContextRef.current = null;
//     }

//     if (window.speechSynthesis) {
//       window.speechSynthesis.cancel();
//     }

//     analyserRef.current = null;
//     setIsActive(false);
//     setIsListening(false);
//     setIsProcessing(false);
//     setIsSpeaking(false);
//     setVolume(0);
//   }, []);

//   const toggleJarvis = () => {
//     if (isActive) {
//       stopJarvis();
//     } else {
//       setIsActive(true);
//       startListening();
//     }
//   };

//   const getStatusText = () => {
//     if (isSpeaking) return 'Speaking...';
//     if (isProcessing) return 'Processing...';
//     if (isListening) return 'Listening...';
//     return 'Ready';
//   };

//   return (
//     <>
//       {previewFile && (
//         <FilePreviewModal 
//           file={previewFile} 
//           onClose={() => {
//             setPreviewFile(null);
//             onCloseFile();
//           }} 
//         />
//       )}

//       <div className="fixed bottom-8 right-8 z-50">
//         <div className="relative">
//           {isActive && (
//             <div className="absolute inset-0 -z-10">
//               <div 
//                 className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-pulse"
//                 style={{
//                   transform: `scale(${1 + volume * 0.8})`,
//                   transition: 'transform 0.1s ease-out'
//                 }}
//               />
//               <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-40 animate-ping" />
//             </div>
//           )}

//           <button
//             onClick={toggleJarvis}
//             className={`
//               relative w-16 h-16 rounded-full shadow-2xl
//               flex items-center justify-center
//               transition-all duration-300 transform hover:scale-110
//               ${isActive 
//                 ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-500/50' 
//                 : 'bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-slate-800/50 hover:from-slate-500 hover:to-slate-700'
//               }
//               cursor-pointer
//             `}
//             aria-label={isActive ? "Stop Jarvis" : "Start Jarvis"}
//           >
//             {isProcessing || isSpeaking ? (
//               <Activity className="w-7 h-7 animate-spin" />
//             ) : isActive ? (
//               <MicOff className="w-7 h-7" />
//             ) : (
//               <Mic className="w-7 h-7" />
//             )}
            
//             <span 
//               className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
//                 isActive ? 'bg-green-500' : 'bg-slate-400'
//               }`}
//             />
//           </button>

//           {isActive && (
//             <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
//               <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${
//                 isSpeaking ? 'bg-purple-900 text-white' :
//                 isProcessing ? 'bg-yellow-900 text-white' :
//                 'bg-slate-900 text-white'
//               }`}>
//                 <span className={`w-2 h-2 rounded-full animate-pulse ${
//                   isSpeaking ? 'bg-purple-400' :
//                   isProcessing ? 'bg-yellow-400' :
//                   'bg-red-500'
//                 }`} />
//                 {getStatusText()}
//               </div>
//             </div>
//           )}

//           {!isActive && (
//             <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
//               <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
//                 Start Jarvis Assistant
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default JarvisAssistant;