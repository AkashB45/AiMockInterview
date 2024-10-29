"use client";
import { useState, useEffect } from "react";
import { db } from "@/utils/db";
import { UserAnswers } from "@/utils/schema";
import { eq } from "drizzle-orm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Feedback = ({ params }) => {
  const [feedbackList, setFeedbacklist] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();

  useEffect(() => {
    feedback();
  }, []);

  const feedback = async () => {
    setLoading(true); // Start loading
    try {
      const result = await db
        .select()
        .from(UserAnswers)
        .where(eq(params.InterviewId, UserAnswers.mockIdRef))
        .orderBy(UserAnswers.id);
      setFeedbacklist(result);
      // console.log(result);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
    setLoading(false); // End loading
  };

  const total = feedbackList.reduce(
    (a, b) => parseInt(a) + parseInt(b.rating),
    0
  );
  const totalRating = parseInt(total / feedbackList.length) || 0;

  return (
    <div className="p-10">
      {loading ? ( // Display loading message while fetching data
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-gray-400 mr-4"></div>{" "}
          <p className="text-gray-500">Loading feedback...</p>
        </div>
      ) : feedbackList.length === 0 ? (
        <>
          <h1 className="text-xl font-bold text-gray-500">
            No Interview Record Found
          </h1>
          <Button onClick={() => router.replace("/dashboard")} className="mt-7">
            Go Home
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-green-500">
            Congratulations!
          </h1>
          <h1 className="text-2xl font-bold my-2">
            Here's your Interview Feedback
          </h1>
          <h2 className="text-lg text-primary my-3">
            Your overall Interview Rating: <strong>{totalRating}/10</strong>
          </h2>
          <h2 className="text-sm text-gray-500">
            Find Interview Questions with Correct answers, Your answer, and
            feedback for improvement
          </h2>
          {feedbackList.map((feedback, index) => (
            <Collapsible key={index} className="mt-7">
              <CollapsibleTrigger className="flex justify-between gap-2 p-2 bg-secondary rounded-lg my-2 text-left w-full">
                {index + 1 + ". "}
                {feedback.question}
                <ChevronDownCircleIcon className="h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col gap-3">
                  <h2 className="text-red-500 p-2 border rounded-lg">
                    <strong>Rating: </strong>
                    {feedback.rating}
                  </h2>
                  <h2 className="bg-red-50 border p-2 rounded-lg text-red-900">
                    <strong>Your Answer: </strong>
                    {feedback.userAns}
                  </h2>
                  <h2 className="bg-green-50 border p-2 rounded-lg text-green-900">
                    <strong>Correct Answer: </strong>
                    {feedback.correctAns}
                  </h2>
                  <h2 className="bg-blue-50 border p-2 rounded-lg text-primary">
                    <strong>Feedback: </strong>
                    {feedback.feedback}
                  </h2>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
          <Button onClick={() => router.replace("/dashboard")} className="mt-7">
            Go Home
          </Button>
        </>
      )}
    </div>
  );
};

export default Feedback;
