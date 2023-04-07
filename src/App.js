import React from "react";
import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";

const App = () => {
  // revert to webkit for better control over mic stop and start?
  // change to force user to start and select?
  // submit current transcript no matter if stopped **
  // timing?
  // make profanity unfilter npm package
  // listen better to not miss any words
  // WebSocket connection to 'ws://localhost:3000/ws' failed: - use webkit instead of package?
  // eleven labs api package?

  // instructions:
  // 1. Open command line and run: `npm i; npm run start` on Windows or `npm i && npm run start` on mac.
  // 2. Input Api key, press start, and select voice. Start speaking to hear the converted audio.

  // To output audio to another source on Windows:
  // 1. Download VAC virtual audio cable. (Could also use something like VoiceMeeter.)
  // 2. Change ouput from browser to virtual audio cable input. (Start > Settings > System > Sound (under Advanced Sound Options) App volume and device preferences > Select top of two options and change to virtual input.)
  // 3. Change whatever application you want to use voice in to use virtual audio cable output as input.

  const { transcript, resetTranscript, listening } = useSpeechRecognition({
    continuous: true,
  });

  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState("");
  const [button, setButton] = useState(null);
  const [text, setText] = useState("");
  // const [listen, setListen] = useState(false);
  const [start, setStart] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [active, setActive] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);
  const [status, setStatus] = useState(null);
  const [apiKey, setApiKey] = useState(
    window.localStorage.getItem("elevenLabsApiKey")
  );
  // e7fd20d862337642310375d8d0fac1b6 my key

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
      // console.log(reader);

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
    // setListen(true);
    setStart(true);
    // clear timeout and start
    await SpeechRecognition.startListening({ continuous: true });
    await audioContext.resume();
  };

  const stopListening = () => {
    // setListen(false);
    SpeechRecognition.stopListening();
  };

  const reset = () => {
    // fix
    stopListening();
    setApiKey(null);
    setStatus(null);
    setVoiceId(null);
    setButton(null);
    setStart(false);
    setVoices([]);
    setText("");
  };

  useEffect(() => {
    if (!!voiceId) {
      if (!active && transcript) {
        const text = transcript;
        resetTranscript();
        console.log(`transcript: ${unfilter(transcript)}`);
        (async () => {
          await getSpeech(text);
        })();
        // getSpeech(text); // dont await response?
      }

      // if (!listening) {
      //   (async () => {
      //     await SpeechRecognition.startListening({ continuous: true });
      //   })();
      // }
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
        // console.log("timeout active!"); // change
        setActive(false);
      }, 1000) // 800
    );
  }, [transcript]);

  useEffect(() => {
    setAudioContext(new AudioContext());
    setStatus(null);
    if (apiKey) {
      (async () => {
        const allVoices = await getVoices();
        setVoices(allVoices.voices);
      })();
    }
  }, [apiKey]);

  return SpeechRecognition.browserSupportsSpeechRecognition() ? (
    <div className="main">
      {!apiKey ? (
        <div>
          <h1>Input your ElevenLabs API Key</h1>
          <div>
            <p>API Key:</p>
            <form>
              <input
                className="form-input"
                type="text"
                id="text"
                name="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                autoComplete="off"
              />
              <button
                className="button-small"
                onClick={() => {
                  setApiKey(text);
                  window.localStorage.setItem("elevenLabsApiKey", text);
                }}
              >
                Submit
              </button>
            </form>
            To access your ElevenLabs API key, head to the official{" "}
            <a href="https://beta.elevenlabs.io/">website</a>, you can view your
            xi-api-key using the 'Profile' tab.
          </div>
        </div>
      ) : (
        <div>
          <div className="button-container">
            <button
              className="top-button"
              onClick={() => {
                reset();
                window.localStorage.removeItem("elevenLabsApiKey");
              }}
            >
              Reset API Key
            </button>
          </div>
          {!start ? (
            <h1>Press start to begin listening</h1>
          ) : !!voiceId ? (
            <h1>Voice changing: {listening ? "on" : "off"}</h1>
          ) : (
            <h1>Select voice</h1>
          )}
          <div>
            <button
              onClick={() => {
                startListening();
                setStatus(true);
              }}
              className={!!status ? "button-active" : "button"}
            >
              Start
            </button>
            <button
              onClick={() => {
                stopListening();
                setStatus(false);
              }}
              className={status === false ? "button-active" : "button"}
            >
              Stop
            </button>
            <button onClick={resetTranscript} className="button">
              Reset
            </button>
          </div>
          {start && (
            <div>
              <div className="voice-container">
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
                Transcript:
                <div className="transcript">
                  {!!voiceId && unfilter(transcript)}
                </div>
              </h2>
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    <div>not working my friend</div>
  );
};

export default React.memo(App);
