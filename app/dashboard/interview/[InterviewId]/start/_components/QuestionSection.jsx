import { Lightbulb, Volume2 } from "lucide-react";
import React from "react";

const QuestionSection = ({ mockInterviewQuestions, activeQuestionIndex,setActiveQuestionIndex }) => {
  // console.log(mockInterviewQuestions);
  // console.log(activeQuestionIndex);
  const TexttoSpeech = (text) => {
    if('speechSynthesis' in window)
    {
    const synth = window.speechSynthesis;
    const speech = new SpeechSynthesisUtterance(text);
    synth.speak(speech);
    }
    else
    {
      alert("Sorry, your browser doesn't support text to speech!");
    }
  };
  return (
    mockInterviewQuestions && (
      <div className="p-5 border rounded-lg my-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mockInterviewQuestions &&
            mockInterviewQuestions.map((question, index) => (
              <div key={index}>
                <h2
                  className={`p-2 border  rounded-full text-xs md:text-sm text-center cursor-pointer  ${
                    activeQuestionIndex == index && "text-white bg-primary "
                  }`}
                  onClick={() => setActiveQuestionIndex(index)}
                >
                  Question #{index + 1}
                </h2>
              </div>
            ))}
        </div>
        <h2 className="my-5 text-md md:text-lg">
          {mockInterviewQuestions[activeQuestionIndex]?.question}
        </h2>
        <Volume2
        className="cursor-pointer"
          onClick={() =>
            TexttoSpeech(mockInterviewQuestions[activeQuestionIndex]?.question)
          }
        />
        <div className="p-5 border rounded-lg bg-blue-100 mt-10">
          <h2 className="flex gap-2 items-center text-primary">
            <Lightbulb />
            <strong>Note:</strong>
          </h2>
          <h2 className="my-2 text-small text-primary">
            {process.env.NEXT_PUBLIC_NOTE}
          </h2>
        </div>
      </div>
    )
  );
};

export default QuestionSection;
