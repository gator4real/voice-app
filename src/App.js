import React from "react";
import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useVoice } from "./voice";
import axios from "axios";

const App = () => {
  // console.log("app");
  const { transcript, resetTranscript, listening } = useSpeechRecognition({
    continuous: true,
  });

  // revert to webkit for better control over mic stop and start

  const apiKey = "e7fd20d862337642310375d8d0fac1b6"; // add input
  const voiceId = "xSV2LpK8ApxOXFOkWpft"; // get all and dropdown
  // trump xSV2LpK8ApxOXFOkWpft
  // angel Ii7yjallwe990yojM3L9
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
  const profanityList = {
    "f***": "fuck",
    "f****": "fucks",
    "f*****": "fucker",
    "f******": "fucking",
    "s***": "shit",
    "b******": "bullshit",
    "s*******": "shitting",
    "a*******": "asshole",
    "c***": "cunt",
    "m*********": "motherfuck",
    "m************": "motherfucking",
    "m***********": "motherfucker",
    "c***": "cock",
    "c*********": "cocksucker",
    "c**********": "cocksucking",
    "d*********": "dicksucker",
    "d**********": "dicksucking",
    "b****": "bitch",
  };

  function unfilter(text) {
    const words = text.split(" ");
    const filteredWords = words.map((word) => {
      if (word in profanityList) {
        return profanityList[word];
      } else {
        return word;
      }
    });
    return filteredWords.join(" ");
  }

  // const unfilter = (text) => {
  //   const array = text.split(" ");
  //   array.forEach((word, index) => {
  //     // expand
  //     if (word.toLowerCase() === "f***") {
  //       array[index] = "fuck";
  //     }
  //   });
  //   return array.join(" ");
  // };

  useEffect(() => {
    const get = async () => {
      const voices = await getVoices();
      console.log(voices);
    };
    get();
  }, []);

  const getVoices = async () => {
    try {
      const response = await fetch(`${url}/v1/voices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
      }).then((response) => response.json());

      console.log(response);
      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const getSpeech = async () => {
    try {
      const response = await fetch(`${url}/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: unfilter(transcript),
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
        console.log(`transcript: ${unfilter(transcript)}`);
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
      <p>{unfilter(transcript)}</p>
    </div>
  ) : (
    <div>not working my friend</div>
  );
};
export default React.memo(App);
