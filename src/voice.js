// import SpeechRecognition, {
//     useSpeechRecognition
//   } from "react-speech-recognition";

// import { useState } from "react";
// const useVoice = () => {
//     const { transcript, resetTranscript, listening } = useSpeechRecognition({
//         continuous: true
//       });


//     const [isListening, setIsListening] = useState(false);
//     const listen = () => {
//       setIsListening(!isListening);
//       if (isListening) {
//         SpeechRecognition.stopListening();
//       } else {
//         SpeechRecognition.startListening();
//       }
//     };
//     useEffect(() => {
//         if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
//             return null;
//           }
//       speech.onresult = event => {
//         setText(event.results[event.results.length - 1][0].transcript);
//         setIsListening(false);
//         speech.stop();
//       };
//     }, [])
//     return {
//       text,
//       isListening,
//       listen,
//       voiceSupported: speech !== null
//     };
//   }
//   export {
//     useVoice,
//   };