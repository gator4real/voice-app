import React from "react";
import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition
} from "react-speech-recognition";
import { useVoice } from './voice';
import axios from "axios";

const App = () => {
  console.log('app')
  const { transcript, resetTranscript, listening } = useSpeechRecognition({
    continuous: true
  });

  // const listening = useState(false);

  // const listen = () => {
  //   if (!listening) {
  //     console.log('listening');
  //     SpeechRecognition.startListening()
  //   }
  // }

  // listen();

  // const {
  //   text,
  //   isListening,
  //   listen,
  //   voiceSupported,
  // } = useVoice();

  // const [isListening, setIsListening] = useState(false);

  //   const listen = () => {
  //     setIsListening(!isListening);
  //     if (isListening) {
  //       SpeechRecognition.stopListening();
  //     } else {
  //       SpeechRecognition.startListening();
  //     }
  //   };

    //     useEffect(() => {
    //     if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    //         return null;
    //       }

    //   listen();
    // }, [transcript, isListening])

  const apiKey = 'e7fd20d862337642310375d8d0fac1b6'; // add input
  const voiceId = '21m00Tcm4TlvDq8ikWAM'; // get all and dropdown
  // const [voices, setVoices] = useState([]);
  const url = 'https://api.elevenlabs.io'
  const [audio, setAudio] = useState(null);
  const audioContext = new AudioContext();

  const getSpeech = async () => {
    // const response = await axios.post(`${url}/v1/text-to-speech/${voiceId}`, {"text": transcript,
    // "voice_settings": {
    //   "stability": 0,
    //   "similarity_boost": 0
    // }}, {headers: {'xi-api-key': apiKey}})
   try {
    // const response = await fetch(`${url}/v1/text-to-speech/${voiceId}`, {method: 'POST', headers: {
    //   'xi-api-key': apiKey
    // }, body: JSON.stringify({
    //   text: transcript,
    //   voice_settings: {
    //     stability: 0,
    //     similarity_boost: 0
    //   }
    // }),})
    const response = await fetch(`${url}/v1/text-to-speech/${voiceId}`, {
      method: 'POST', 
      headers: {
        "Content-Type": "application/json",
        'xi-api-key': apiKey
      }, 
      body: JSON.stringify({
        "text": transcript, 
        "voice_settings": {
          "stability": 0, "similarity_boost": 0
        }
      })
    });

    console.log(response);

    const reader = response.body.getReader();
    const audioChunks = [];

    while (true) {
      const {done, value} = await reader.read();
      if (done) {
        break;
      }
      audioChunks.push(value);
    }

    const audioBlob = new Blob(audioChunks);

    // const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());

    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioContext.destination)
    audioSource.start(0)

    await reader.closed;
    console.log('audio stream ended')

    return response?.data;
  } catch (error) {
    console.log(error);
   }
  }

  useEffect(() => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      return null;
    }

    if (transcript) {
      console.log(transcript);
      const speechy = async () => {
        const speech = await getSpeech();
        console.log(speech)
        // const audio = new Audio(speech)
        // console.log(audio);
        // setAudio(audio);
        console.log(speech);
        setAudio(speech);
      }
      speechy();
    }
    
    SpeechRecognition.startListening();
  }, [listening])

  // useEffect(() => {
  //   // console.log(transcript);
  // }, [transcript])
  let voices;

  // const getVoices = async() => {
  //   voices = await axios.get(`${url}/v1/voices`, {headers: {'xi-api-key': apiKey}})
  //   console.log(voices?.data?.voices);
  //   // setVoices(voices?.data?.voices)
  // }

  // getVoices();

  return (
    <div>
      {voices?.forEach((voice) => {
        return (<h2>{voice}</h2>)
      })}
      <h1>mic is {listening ? 'on' : 'off'}</h1>
      <audio preload="auto" src={audio}></audio>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <button onClick={audioContext.resume}>Play</button>
      <p>{transcript}</p>
    </div>
  );
};
export default App;
