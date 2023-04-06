import React from "react";
import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";

const App = () => {
  // revert to webkit for better control over mic stop and start?
  // change to force user to start and select?
  // submit current transcript no matter if stopped
  // timing?
  const { transcript, resetTranscript, listening } = useSpeechRecognition({
    continuous: true,
  });

  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState("");
  const [button, setButton] = useState(null);
  const [text, setText] = useState(null);
  const [listen, setListen] = useState(false);
  const [start, setStart] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [active, setActive] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);
  const [apiKey, setApiKey] = useState("e7fd20d862337642310375d8d0fac1b6"); // change to empty for user input

  const url = "https://api.elevenlabs.io";

  const profanityList = {
    "f***": "fuck",
    "f****": "fucks",
    "f*****": "fucker",
    "f******": "fucking",
    "s***": "shit",
    "b******": "bitches",
    "b*******": "bullshit",
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

  const unfilter = (text) => {
    const words = text.split(" ");
    const filteredWords = words.map((word) => {
      if (word in profanityList) {
        return profanityList[word];
      } else {
        return word;
      }
    });
    return filteredWords.join(" ");
  };

  const getVoices = async () => {
    try {
      const response = await fetch(`${url}/v1/voices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
      }).then((response) => response.json());

      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const getSpeech = async (text) => {
    try {
      const response = await fetch(`${url}/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: unfilter(text),
          voice_settings: {
            stability: 0,
            similarity_boost: 0,
          },
        }),
      });

      const reader = response.body.getReader();
      console.log(reader);

      const audioChunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
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
      return;
    } catch (error) {
      console.log(error);
    }
  };

  const startListening = async () => {
    setListen(true);
    setStart(true);
    // clear timeout and start
    await SpeechRecognition.startListening({ continuous: true });
    await audioContext.resume();
  };

  const stopListening = async () => {
    setListen(false);
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    if (listen && !!voiceId) {
      if (!active && transcript) {
        const text = transcript;
        resetTranscript();
        console.log(`transcript: ${unfilter(transcript)}`);
        (async () => {
          await getSpeech(text);
        })();
      }

      if (!listening) {
        SpeechRecognition.startListening();
      }
    } else {
      resetTranscript();
    }
  }, [active]);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setActive(true);
    }

    setTimeoutId(
      setTimeout(() => {
        console.log("timeout active!");
        setActive(false);
      }, 1000) // 800
    );
  }, [transcript]);

  useEffect(() => {
    setAudioContext(new AudioContext());
    (async () => {
      const allVoices = await getVoices();
      setVoices(allVoices.voices);
    })();
  }, [apiKey]);

  return SpeechRecognition.browserSupportsSpeechRecognition() ? (
    <div className="main">
      {!apiKey && (
        <div>
          <p>API Key: {}</p>
          <form>
            <input
              type="text"
              id="text"
              name="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              autoComplete="off"
            />
            <button
              onClick={() => {
                setApiKey(text);
              }}
            >
              Submit
            </button>
          </form>
        </div>
      )}
      {!start ? (
        <h1>Press start to begin listening</h1>
      ) : !!voiceId ? (
        <h1>Voice changing: {listening ? "on" : "off"}</h1>
      ) : (
        <h1>Select voice</h1>
      )}
      <div>
        <button onClick={startListening} className="button">
          Start
        </button>
        <button onClick={stopListening} className="button">
          Stop
        </button>
        <button onClick={resetTranscript} className="button">
          Reset
        </button>
      </div>
      <div>
        <h2>Voices:</h2>
        {voices?.map((voice, index) => {
          return (
            <button
              key={index}
              className={button === index ? "button-active" : "button"}
              onClick={() => {
                setButton(index);
                setVoiceId(voice.voice_id);
              }}
            >
              {voice.name}
            </button>
          );
        })}
      </div>
      <h2>
        Transcript: <div className="transcript">{unfilter(transcript)}</div>
      </h2>
    </div>
  ) : (
    <div>not working my friend</div>
  );
};

export default React.memo(App);
