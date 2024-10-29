import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
const DashboardPage = () => {
  return (
    <div className="p-10">
      <h1 className="font-bold text-2xl">DashBoard</h1>
      <h2 className="text-gray-500">
        Create and Start your AI Mock Interview!
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 my-5">
        <AddNewInterview/>
      </div>
      <InterviewList/>
    </div>
  );
};

export default DashboardPage;
