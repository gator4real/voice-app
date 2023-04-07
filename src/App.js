import React from "react";
import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";
import { Instructions } from "./instructions";
import { unfilter } from "speech-enhancer";

const App = () => {
  const { transcript, resetTranscript, listening } = useSpeechRecognition({
    continuous: true,
  });

  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState("");
  const [button, setButton] = useState(null);
  const [text, setText] = useState("");
  const [start, setStart] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [active, setActive] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);
  const [status, setStatus] = useState(null);
  const [showInstructions, setShowInstructions] = useState(null);
  const [apiKey, setApiKey] = useState(
    window.localStorage.getItem("elevenLabsApiKey")
  );

  const url = "https://api.elevenlabs.io";

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
    setStart(true);
    await SpeechRecognition.startListening({ continuous: true });
    await audioContext.resume();
  };

  const stopListening = () => {
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
        setActive(false);
      }, 1000) // 800
    );
  }, [transcript]);

  useEffect(() => {
    if (SpeechRecognition.browserSupportsSpeechRecognition()) {
      setAudioContext(new AudioContext());
    }
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
          <Instructions
            showInstructions={showInstructions}
            setShowInstructions={setShowInstructions}
          />
          <h1>Input your ElevenLabs API Key</h1>
          To access your ElevenLabs API key, head to the official{" "}
          <a href="https://beta.elevenlabs.io/">website</a>, you can view your
          xi-api-key using the 'Profile' tab.
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
          </div>
        </div>
      ) : (
        <div>
          <div className="button-container">
            <button
              className="top-button"
              onClick={() => {
                showInstructions
                  ? setShowInstructions(false)
                  : setShowInstructions(true);
              }}
            >
              Instructions
            </button>
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

          {showInstructions ? (
            <div>
              <h3>Instructions:</h3>
              <p>
                Input API key, press start, and select voice. Start speaking to
                hear the converted audio. (If your mic can hear your speakers,
                it will probably start looping audio.)
              </p>

              <h4>To output audio to another source on Windows:</h4>
              <p>
                {" "}
                1. Download VAC virtual audio cable. (Or use any software of
                your choice.){" "}
              </p>
              <p>
                {" "}
                {`2. Change ouput from browser to virtual audio cable input. (Start > Settings > System > Sound (under Advanced Sound Options) App volume and device preferences > Select top of two options and change to virtual input.)`}{" "}
              </p>
              <p>
                {" "}
                3. Change whatever application you want to use voice in to use
                virtual audio cable output, as input.{" "}
              </p>
              <button
                onClick={() => {
                  setShowInstructions(false);
                }}
              >
                Return
              </button>
            </div>
          ) : (
            <div>
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
                          className={
                            button === index ? "button-active" : "button"
                          }
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
      )}
    </div>
  ) : (
    <div>not working with your browser my friend</div>
  );
};

export default React.memo(App);
