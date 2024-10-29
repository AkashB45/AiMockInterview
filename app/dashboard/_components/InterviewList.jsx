"use client";
import { db } from "@/utils/db";
import { mockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    setLoading(true); // Set loading to true while data is being fetched
    try {
      const result = await db
        .select()
        .from(mockInterview)
        .where(
          eq(user?.primaryEmailAddress.emailAddress, mockInterview.createdBy)
        )
        .orderBy(desc(mockInterview.id));
      // console.log(result);
      setInterviewList(result);
    } catch (error) {
      console.error("Error fetching interview list:", error);
    }
    setLoading(false); // Set loading to false after data is fetched
  };

  return (
    <div>
      <h2 className="font-medium text-2xl">Previous Mock Interviews</h2>
      {loading ? ( // Show loading state while fetching data
        <div className="flex justify-center items-center my-5">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-gray-400 mr-4"></div>{" "}
          <p className="text-gray-500">  Loading interview records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
          {interviewList.length > 0 ? (
            interviewList.map((interview, index) => (
              <InterviewItemCard interview={interview} key={index} />
            ))
          ) : (
            <div className="flex justify-center items-center">
              <p className="text-gray-500">No Interview Records found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewList;
