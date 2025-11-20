"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

    // Call server API route that performs the generative AI request server-side
    const respApi = await fetch(`/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: inputPrompt }),
    });

    if (!respApi.ok) {
      // Try to parse JSON error body, otherwise log text
      let errBody;
      try {
        errBody = await respApi.json();
      } catch (e) {
        errBody = await respApi.text();
      }
      console.error("/api/generate failed", respApi.status, errBody);
      setLoading(false);
      return;
    }

    const data = await respApi.json();
    if (data?.error) {
      console.error("/api/generate returned error:", data.error);
      setLoading(false);
      return;
    }

    let MockResponse = (data?.output || "").toString();

    // Helper: try to extract JSON from any surrounding text (code fences, explanation)
    const extractJSONFromText = (text) => {
      if (!text) return null;
      // Try fenced ```json blocks first
      const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i);
      if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();

      // Try to find the first JSON object/array by locating matching braces
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

    const extracted = extractJSONFromText(MockResponse);
    if (extracted) {
      MockResponse = extracted;
    } else {
      // remove common fences as a fallback
      MockResponse = MockResponse.replace(/```json/i, "").replace(/```/g, "");
    }

    if (!MockResponse || MockResponse.trim() === "") {
      console.error("Empty response from AI after extraction, aborting save.");
      setLoading(false);
      return;
    }

    try {
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
      router.push(`/dashboard/interview/${resp[0].mockId}`);
    } catch (e) {
      console.error("DB insert error", e);
      setLoading(false);
      return;
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
              <div className="text-sm text-muted-foreground">
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
              </div>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
