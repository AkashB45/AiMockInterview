"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAiModel";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { mockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment/moment";
import { useRouter } from "next/navigation";
const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [yearOfExperience, setYearOfExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    const inputPrompt = `Job Position: ${jobRole}, Job Description: ${jobDescription} Years of Experience: ${yearOfExperience}, Depends on this information please give me ${process.env.NEXT_PUBLIC_QUESTION_COUNT} Interview question with answered in Json Format, Give question and answered as field in JSON as "question" and "answer" in small letters(field names)`;
    const result = await chatSession.sendMessage(inputPrompt);
    const MockResponse = await result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    // console.log(JSON.parse(MockResponse));
    setJsonResponse(MockResponse);
    if(result)
    {
    const resp = await db
      .insert(mockInterview)
      .values({
        mockId: uuidv4(),
        jsonMockRep: MockResponse,
        jobPosition: jobRole,
        jobDesc: jobDescription,
        jobExper: yearOfExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-yyyy"),
      })
      .returning({ mockId: mockInterview.mockId });
      // console.log("Inserteed ID:",resp);
      router.push(`/dashboard/interview/${resp[0].mockId}`);
    }
    else
    {
      console.log("ERROR");
    }
    setLoading(false);

    // Reset form and close dialog
    setJobRole("");
    setJobDescription("");
    setYearOfExperience("");
    setOpenDialog(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(!openDialog);
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => handleOpenDialog()}
      >
        <h1 className="text-lg text-center">+ Add New</h1>
      </div>
      <Dialog open={openDialog} onOpenChange={handleOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <form onSubmit={onSubmit}>
              <DialogTitle className="text-2xl">
                Tell us more about job you are interviewing
              </DialogTitle>
              <DialogDescription>
                <h2>
                  Add Details about the job position, your skills, and years of
                  experience
                </h2>
                <div className="mt-7 my-2">
                  <label>Job Role/Job Position</label>
                  <Input
                    value={jobRole}
                    placeholder="Ex. FullStack Development"
                    onChange={(e) => setJobRole(e.target.value)}
                    required
                  />
                </div>
                <div className="my-3">
                  <label>Job Description / Tech Stack (short)</label>
                  <Textarea
                    value={jobDescription}
                    placeholder="Ex. React, Angular, mySQL etc.."
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="my-2">
                  <label>Years of Experience</label>
                  <Input
                    value={yearOfExperience}
                    placeholder="Ex. 5"
                    onChange={(e) => setYearOfExperience(e.target.value)}
                    type="number"
                    max="70"
                    required
                  />
                </div>
                <div className="flex gap-5 justify-end">
                  <Button variant="ghost" onClick={() => handleOpenDialog()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        'Generating from AI'
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </DialogDescription>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
