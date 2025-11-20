"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import Webcam from "react-webcam";
import { toast } from "@/hooks/use-toast";
// Use server API route for generation
import { db } from "@/utils/db";
import { UserAnswers } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { eq } from "drizzle-orm";
import * as faceapi from "face-api.js";
import _ from 'lodash';

const RecordAnswerSection = ({
  mockInterviewQuestions,
  activeQuestionIndex,
  interviewData,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [expressions, setExpressions] = useState({});
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const { user } = useUser();

  const {
    error,
    interimResult,
    isRecording,
    results,
    setResults,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    setModelsLoaded(true);
  };

  useEffect(() => {
    loadModels();
  }, []);

  // Update userAnswer without repeating phrases

  useEffect(() => {
    if (results.length > 0) {
      const latestTranscript = results[results.length - 1]?.transcript || "";
  
      // Split the current answer into sentences
      const currentSentences = userAnswer.split('.').map(sentence => sentence.trim()).filter(Boolean);
  
      // Split the latest transcript into sentences
      const newSentences = latestTranscript.split('.').map(sentence => sentence.trim()).filter(Boolean);
  
      // Use Lodash to create a unique array of sentences without duplicates
      const uniqueSentences = _.uniq([...currentSentences, ...newSentences]);
  
      // Filter out any sentences that are too similar to the previous answer
      const filteredSentences = uniqueSentences.filter(sentence => {
        const pattern = new RegExp(`^${_.escapeRegExp(sentence)}$`, 'i'); // Regex to match the exact sentence ignoring case
        return !currentSentences.some(currentSentence => pattern.test(currentSentence));
      });
  
      // Update userAnswer with the filtered unique sentences
      setUserAnswer(filteredSentences.join('. ') + (filteredSentences.length > 0 ? '. ' : ''));
    }
  }, [results]);
  

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      updateUserAnswer();
    }
  }, [userAnswer]);

  const detectExpressions = async () => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      try {
        const detections = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections && detections.detection && detections.detection.box) {
          const { box } = detections.detection;
          if (box.width && box.height) {
            const resizedDetections = faceapi.resizeResults(detections, {
              width: videoWidth,
              height: videoHeight,
            });

            const context = canvasRef.current.getContext("2d");
            context.clearRect(0, 0, videoWidth, videoHeight);

            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceExpressions(
              canvasRef.current,
              resizedDetections
            );

            setExpressions(detections.expressions);
          }
        }
      } catch (error) {
        console.error("Error detecting facial expressions:", error);
      }
    }
  };

  useEffect(() => {
    if (webcamActive && modelsLoaded) {
      const intervalId = setInterval(() => detectExpressions(), 100);
      return () => clearInterval(intervalId);
    }
  }, [webcamActive, modelsLoaded]);

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const updateUserAnswer = async () => {
    setLoading(true);

    let emotionFeedback = "";
    if (webcamActive) {
      emotionFeedback = generateEmotionFeedback(expressions);
    } else {
      emotionFeedback = "Webcam is not active; no facial feedback available.";
    }

    const feedback = `Question: "${mockInterviewQuestions[activeQuestionIndex]?.question}". 
       User Answer: "${userAnswer}". 
       Facial Feedback: "${emotionFeedback}". 
       Based on the question and your response, please provide a rating for the answer (on a scale of 1 to 10). 
    
       In the feedback field, include:
       1. Areas for improvement, if any, in 3 to 5 lines.
       2. Suggestions derived from facial feedback, considering emotions like nervousness, confidence, or neutrality.
       3. Specific recommendations for enhancing communication and presentation skills, including strategies for managing nervousness or boosting confidence.
    
       Please format your response in JSON with the following structure:
       {
         "rating": <number>,
         "feedback": "<string incorporating user answer and facial feedback>"
       }`;

    // Call server API route (server-side uses the API key) with retries on 502/503
    const callGenerate = async (prompt, attempts = 3) => {
      let lastErr = null;
      for (let i = 1; i <= attempts; i++) {
        try {
          const res = await fetch(`/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          });

          if (res.ok) {
            try { return { ok: true, data: await res.json() }; } catch(e){ return { ok: false, error: 'Invalid JSON from server' }; }
          }

          // parse error body if possible
          let body;
          try { body = await res.json(); } catch (e) { body = await res.text(); }

          // Retry on transient server/unavailable responses
          if (res.status === 502 || res.status === 503 || res.status === 504) {
            lastErr = body || `Server ${res.status}`;
            const delay = i * 1000;
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }

          // Non-retryable error
          return { ok: false, status: res.status, body };
        } catch (err) {
          lastErr = err;
          const delay = i * 1000;
          await new Promise((r) => setTimeout(r, delay));
        }
      }
      return { ok: false, error: lastErr };
    };

    const genResp = await callGenerate(feedback, 3);
    if (!genResp.ok) {
      console.error('/api/generate failed after retries', genResp);
      toast({ variant: 'destructive', title: 'AI Service Error', description: 'AI generation failed after retries. Please try again later.' });
      setLoading(false);
      return;
    }

    const data = genResp.data;
    if (data?.error) {
      console.error("/api/generate returned error:", data.error, data.models);
      toast({ variant: "destructive", title: "AI Error", description: data.error });
      setLoading(false);
      return;
    }

    let MockResponse = (data?.output || "").toString();

    // Try to extract JSON block (robust)
    const extractJSONFromText = (text) => {
      if (!text) return null;
      const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i);
      if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();
      const startIdxObj = text.indexOf("{");
      const startIdxArr = text.indexOf("[");
      let startIdx = -1; let openChar=null; let closeChar=null;
      if (startIdxObj === -1 && startIdxArr === -1) return null;
      if (startIdxObj === -1) { startIdx = startIdxArr; openChar = '['; closeChar = ']'; }
      else if (startIdxArr === -1) { startIdx = startIdxObj; openChar = '{'; closeChar = '}'; }
      else { if (startIdxObj < startIdxArr) { startIdx = startIdxObj; openChar = '{'; closeChar = '}'; } else { startIdx = startIdxArr; openChar = '['; closeChar = ']'; } }
      let depth = 0; let inString=false; let escaped=false;
      for (let i = startIdx; i < text.length; i++) {
        const ch = text[i];
        if (ch === "\\" && !escaped) { escaped = true; continue; }
        if (ch === '"' && !escaped) inString = !inString;
        if (!inString) { if (ch === openChar) depth++; else if (ch === closeChar) depth--; }
        if (escaped) escaped = false;
        if (depth === 0) return text.slice(startIdx, i+1).trim();
      }
      return null;
    };

    const extracted = extractJSONFromText(MockResponse);
    let sanitizedResponse = "";
    if (extracted) sanitizedResponse = extracted;
    else sanitizedResponse = MockResponse.replace(/```json/i, "").replace(/```/g, "");

    // Remove control chars but keep common punctuation and spaces
    sanitizedResponse = sanitizedResponse.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    try {
      const JSONFeedbackResp = JSON.parse(sanitizedResponse);

      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const question = mockInterviewQuestions[activeQuestionIndex]?.question;
      const mockIdRef = interviewData.mockId;

      const existingAnswers = await db
        .select()
        .from(UserAnswers)
        .where(eq(UserAnswers.mockIdRef, mockIdRef))
        .where(eq(UserAnswers.userEmail, userEmail))
        .where(eq(UserAnswers.question, question));

      if (existingAnswers.length > 0) {
        await db
          .delete(UserAnswers)
          .where(eq(UserAnswers.mockIdRef, mockIdRef))
          .where(eq(UserAnswers.userEmail, userEmail))
          .where(eq(UserAnswers.question, question));
      }

      const resp = await db.insert(UserAnswers).values({
        mockIdRef,
        question,
        correctAns: mockInterviewQuestions[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        rating: JSONFeedbackResp.rating,
        feedback: JSONFeedbackResp.feedback + " " + emotionFeedback,
        userEmail,
        createdAt: moment().format("DD-MM-yyyy"),
      });

      if (resp) {
        toast({
          variant: "default",
          title: "Answer Saved Successfully",
        });
      }

      setResults([]);
      setLoading(false);
      setUserAnswer("");
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Answer",
        description:
          "There was an issue processing your response. Please try again.",
      });
      setLoading(false);
    }
  };

  const generateEmotionFeedback = (expressions) => {
    let feedback = "";

    if (
      expressions.sad > 0.5 ||
      expressions.fearful > 0.5 ||
      expressions.angry > 0.5 ||
      expressions.disgusted > 0.5
    ) {
      feedback +=
        "It seems you might be feeling nervous or tense. Try to relax, take deep breaths, and project more confidence by smiling and maintaining a calm demeanor.";
    } else if (expressions.neutral > 0.5) {
      feedback +=
        "Your expression appears neutral. Consider showing more enthusiasm and energy in your responses to make a stronger impression.";
    } else if (expressions.happy > 0.5) {
      feedback +=
        "Great job! You appear confident and engaged. Keep up the positive energy!";
    }

    return feedback;
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-10 justify-center items-center bg-slate-900 rounded-lg pt-1 pb-1 pr-1 pl-1 relative">
        {!webcamActive && (
          <Image
            src={"/webcam.png"}
            width={200}
            height={200}
            alt="webcam"
            className="absolute"
          />
        )}
        <Webcam
          ref={webcamRef}
          mirrored={true}
          style={{
            zIndex: 1,
            height: 300,
            width: "100%",
            position: "relative",
          }}
          onUserMedia={() => setWebcamActive(true)}
          onUserMediaError={() => setWebcamActive(false)}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            zIndex: 2,
            height: 300,
            width: "100%",
          }}
        />
      </div>
      <Button variant="outline" className="my-10" onClick={StartStopRecording}>
        {isRecording ? (
          <div className="text-red-600 font-semibold flex items-center justify-center gap-2">
            <MicOff className="w-4 h-4 mr-2" /> Stop Recording
          </div>
        ) : (
          <div className="text-primary font-semibold flex items-center justify-center gap-2">
            <Mic className="w-4 h-4 mr-2" /> Start Recording
          </div>
        )}
      </Button>
    </div>
  );
};

export default RecordAnswerSection;
