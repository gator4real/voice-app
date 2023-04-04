import React from "react";
import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useVoice } from "./voice";
import axios from "axios";

const App = () => {
  console.log("app");
  const { transcript, resetTranscript, listening } = useSpeechRecognition({
    continuous: true,
  });

  const apiKey = "e7fd20d862337642310375d8d0fac1b6"; // add input
  const voiceId = "21m00Tcm4TlvDq8ikWAM"; // get all and dropdown
  // const [voices, setVoices] = useState([]);
  const url = "https://api.elevenlabs.io";
  const [audioContext, setAudioContext] = useState(null);

  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  // const audioContext = new AudioContext(); //instantiate

  // Create an empty audio buffer
  // const audioBuffer1 = audioContext.createBuffer(2, 1, audioContext.sampleRate);

  // Create an AudioBufferSourceNode to play the audio
  // const audioSource = audioContext.createBufferSource();
  // // audioSource.buffer = audioBuffer1;
  // audioSource.connect(audioContext.destination);

  // recognition.start();

  const getSpeech = async () => {
    try {
      const response = await fetch(`${url}/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: transcript,
          voice_settings: {
            stability: 0,
            similarity_boost: 0,
          },
        }),
      });

      console.log(response.body);

      const reader = response.body.getReader();
      console.log(reader);

      const audioChunks = [];
      // let audioLength = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        // audioLength += value.byteLength;
        audioChunks.push(value);
      }

      const audioBlob = new Blob(audioChunks);
      const audioArrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer);

      // Set the decoded audio buffer as the source for the AudioBufferSourceNode and play it
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      audioSource.start();

      // const reader = response.body.getReader();
      // const audioChunks = [];

      // while (true) {
      //   const { done, value } = await reader.read();
      //   if (done) {
      //     break;
      //   }
      //   audioChunks.push(value);
      //   console.log(value);
      // }

      // const audioBlob = new Blob(audioChunks);

      // const audioBuffer = await audioContext.decodeAudioData(
      //   await audioBlob.arrayBuffer()
      // );

      // const audioSource = audioContext.createBufferSource();
      // audioSource.buffer = audioBuffer;
      // audioSource.connect(audioContext.destination);
      // audioSource.start(0);

      // await reader.closed;
      // console.log("audio stream ended");

      return;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (listen) {
      console.log(listening);
      if (transcript) {
        console.log(`transcript: ${transcript}`);
        const speechy = async () => {
          const speech = await getSpeech();
          console.log(speech);
        };
        speechy();
        resetTranscript();
        // SpeechRecognition.stopListening();
      }

      if (!listening) {
        SpeechRecognition.startListening();
      }
    }
  }, [listening]);

  let voices;

  const [listen, setListen] = useState(false);

  const startListening = async () => {
    setListen(true);
    await SpeechRecognition.startListening();
    await audioContext.resume();
  };

  const stopListening = async () => {
    setListen(false);
    SpeechRecognition.stopListening();
  };

  return SpeechRecognition.browserSupportsSpeechRecognition() ? (
    <div>
      {voices?.forEach((voice) => {
        return <h2>{voice}</h2>;
      })}
      <h1>mic is {listening ? "on" : "off"}</h1>
      <button onClick={startListening}>Start</button>
      <button onClick={stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      {/* <button onClick={audioContext.resume}>Play</button> */}
      <p>{transcript}</p>
    </div>
  ) : (
    <div>not working my friend</div>
  );
};
export default React.memo(App);
