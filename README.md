### Version 0.0.0.0.0.1

### Notes:

It's kinda buggy and cuts off your voice sometimes. The audio streams don't always sound good or human-like (not my fault). There's also 2-3 seconds of latency from when you're done speaking until the audio returns which is poopy. Will probably do more with this..

### Instructions:

1. Go to [https://gator4real.github.io/voice-app/](https://gator4real.github.io/voice-app/) OR Clone repo, open command line, and run: `npm i; npm run start` on Windows or `npm i && npm run start` on mac.
2. Obtain an API Key from [Eleven Labs](https://beta.elevenlabs.io/). Sign up and find your API key under Profile.
3. Input API key, press start, and select voice. Start speaking to hear the converted audio. (If your mic can hear your speakers, press stop when you're done talking to avoid looping.)

#### To output audio to another source on Windows:

1. Download VAC virtual audio cable. (Or any tool for the same purpose.)
2. Change ouput from browser to virtual audio cable input. (Start > Settings > System > Sound (under Advanced Sound Options) App volume and device preferences > Select top of two options and change to virtual input.)
3. Change whatever application you want to use voice in to use virtual audio cable output, as input.
