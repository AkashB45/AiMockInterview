import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

const InterviewItemCard = ({ interview }) => {
    const router = useRouter();
    const onStart = ()=>{
        router.push(`dashboard/interview/${interview?.mockId}`)
    }
    const onFeedback=()=>{
        router.push(`dashboard/interview/${interview?.mockId}/feedback`)
    }
  return (
    <div className="border p-3 shadow-sm rounded-lg ">
      <h2 className="font-bold text-primary">{interview?.jobPosition}</h2>
      <h2 className="text-sm text-gray-600">{interview?.jobExper} years of Experience </h2>
      <h2 className="text-xs text-gray-400">created At: {interview?.createdAt}</h2>
      <div className="flex justify-between mt-2 gap-3">
        <Button size="sm" variant="outline" onClick={onFeedback} className="w-full">FeedBack</Button>
        <Button size="sm" onClick={onStart} className="w-full">Start Interview</Button>
      </div>
    </div>
  );
};

export default InterviewItemCard;
