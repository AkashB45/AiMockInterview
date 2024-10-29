"use client";
import { db } from "@/utils/db";
import { mockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const StartInterview = ({ params }) => {
  const [interviewData, setInterviewData] = useState();
  const router = useRouter();
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const getInterviewDeatils = async () => {
    const result = await db
      .select()
      .from(mockInterview)
      .where(eq(mockInterview.mockId, params.InterviewId));
      const jsonMockUp = await JSON.parse(result[0].jsonMockRep);
       setMockInterviewQuestions(jsonMockUp);
      // console.log(mockInterviewQuestions);
    setInterviewData(result[0]);
  };
  useEffect(() => {
    getInterviewDeatils();
  }, []);
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <QuestionSection
          mockInterviewQuestions={mockInterviewQuestions}
          activeQuestionIndex={activeQuestionIndex}
          setActiveQuestionIndex={setActiveQuestionIndex}
        />
        <RecordAnswerSection
          interviewData={interviewData}
          mockInterviewQuestions={mockInterviewQuestions}
          activeQuestionIndex={activeQuestionIndex}
        />
      </div>
      <div className="flex justify-end gap-6">
        {activeQuestionIndex > 0 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
            className="rounded-full"
          >
            Previuos Question
          </Button>
        )}
        {activeQuestionIndex != mockInterviewQuestions.length - 1 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
            className="rounded-full"
          >
            Next Question
          </Button>
        )}
        {activeQuestionIndex == mockInterviewQuestions.length - 1 && (
         <Button onClick={()=>(router.push("feedback"))} className="rounded-full">End Interview</Button>
        )}
      </div>
    </div>
  );
};

export default StartInterview;
