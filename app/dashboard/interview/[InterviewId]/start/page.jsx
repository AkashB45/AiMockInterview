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
      const raw = result[0].jsonMockRep;
      const extractJSONFromText = (text) => {
        if (!text) return null;
        const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i);
        if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();
        const startIdxObj = text.indexOf("{");
        const startIdxArr = text.indexOf("[");
        let startIdx = -1;
        let openChar = null;
        let closeChar = null;
        if (startIdxObj === -1 && startIdxArr === -1) return null;
        if (startIdxObj === -1) {
          startIdx = startIdxArr; openChar = "["; closeChar = "]";
        } else if (startIdxArr === -1) {
          startIdx = startIdxObj; openChar = "{"; closeChar = "}";
        } else {
          if (startIdxObj < startIdxArr) { startIdx = startIdxObj; openChar = "{"; closeChar = "}"; }
          else { startIdx = startIdxArr; openChar = "["; closeChar = "]"; }
        }
        let depth = 0;
        let inString = false;
        let escaped = false;
        for (let i = startIdx; i < text.length; i++) {
          const ch = text[i];
          if (ch === "\\" && !escaped) { escaped = true; continue; }
          if (ch === '"' && !escaped) inString = !inString;
          if (!inString) {
            if (ch === openChar) depth++;
            else if (ch === closeChar) depth--;
          }
          if (escaped) escaped = false;
          if (depth === 0) {
            return text.slice(startIdx, i + 1).trim();
          }
        }
        return null;
      };

      let jsonMockUp;
      try {
        jsonMockUp = JSON.parse(raw);
      } catch (err) {
        // Attempt to extract JSON portion and parse
        const extracted = extractJSONFromText(raw);
        if (extracted) {
          try {
            jsonMockUp = JSON.parse(extracted);
          } catch (err2) {
            console.error("Failed to parse extracted JSON", err2);
            jsonMockUp = [];
          }
        } else {
          console.error("Failed to parse JSON and no extractable JSON found", err);
          jsonMockUp = [];
        }
      }
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
