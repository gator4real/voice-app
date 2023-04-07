export const Instructions = (props) => {
  return (
    <div>
      <div className="button-container">
        <button
          className="top-button"
          onClick={() => {
            props.showInstructions
              ? props.setShowInstructions(false)
              : props.setShowInstructions(true);
          }}
        >
          Instructions
        </button>
      </div>

      {props.showInstructions && (
        <div>
          <h3>Instructions:</h3>
          <p>
            Input API key, press start, and select voice. Start speaking to hear
            the converted audio. (If your mic can hear your speakers, it will
            probably start looping audio.)
          </p>

          <h4>To output audio to another source on Windows:</h4>
          <p>
            {" "}
            1. Download VAC virtual audio cable. (Or use any software of your
            choice.){" "}
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
        </div>
      )}
    </div>
  );
};
