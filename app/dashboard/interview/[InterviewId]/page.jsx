"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { mockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";

const Interview = ({ params }) => {
  const [interviewData, setInterviewData] = useState([]);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [expressions, setExpressions] = useState({});
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();

  // Fetch interview details
  const getInterviewDetails = async () => {
    const result = await db
      .select()
      .from(mockInterview)
      .where(eq(mockInterview.mockId, params.InterviewId));
    setInterviewData(result[0]);
  };

  // Load face-api.js models
  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    setModelsLoaded(true);
  };

  // Detect facial expressions
  const detectExpressions = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      canvasRef.current
    ) {
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

        // Log the detection result for inspection
        // console.log("Detections:", detections);

        // Check if face is detected and bounding box is valid
        if (detections && detections.detection && detections.detection.box) {
          const canvas = canvasRef.current;
          const context = canvas.getContext("2d");

          // Clear the canvas before drawing
          context.clearRect(0, 0, videoWidth, videoHeight);

          const resizedDetections = faceapi.resizeResults(detections, {
            width: videoWidth,
            height: videoHeight,
          });

          faceapi.matchDimensions(canvas, {
            width: videoWidth,
            height: videoHeight,
          });

          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

          // Update state with detected expressions
          setExpressions(detections.expressions);
        } else {
          console.warn("No face detected or bounding box is invalid.");
        }
      } catch (error) {
        console.error("Error detecting expressions:", error);
      }
    }
  };

  useEffect(() => {
    getInterviewDetails();
    loadModels();
  }, []);

  useEffect(() => {
    if (webcamEnabled && modelsLoaded) {
      const intervalId = setInterval(() => detectExpressions(), 100);
      return () => clearInterval(intervalId);
    }
  }, [webcamEnabled, modelsLoaded]);

  // Stop webcam and navigate when "Start Interview" is clicked
  const handleStartInterview = () => {
    // setWebcamEnabled(false); // Turn off webcam
    router.push(`${params.InterviewId}/start`); // Navigate to the interview start
  };

  return (
    <div className="my-10">
      <h1 className="font-bold text-2xl">Let's get Started</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left side: Interview Details */}
        <div className="flex flex-col my-5 gap-5">
          <div className="flex flex-col p-5 rounded-lg border gap-5">
            <h2 className="text-lg">
              <strong>Job Role/Job position:</strong>{" "}
              {interviewData.jobPosition}
            </h2>
            <h2 className="text-lg">
              <strong>Job Description/TechStack:</strong>{" "}
              {interviewData.jobDesc}
            </h2>
            <h2 className="text-lg">
              <strong>Years of Experience:</strong> {interviewData.jobExper}
            </h2>
          </div>
          <div className="p-5 border rounded-lg bg-yellow-100 border-yellow-500">
            <h2 className="flex gap-2 items-center text-yellow-500">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <h2 className="mt-3 text-yellow-500">
              {process.env.NEXT_PUBLIC_INFORMATION}
            </h2>
          </div>
        </div>

        {/* Right side: Webcam and Facial Expression Detection */}
        <div className="flex flex-col items-center justify-center">
          {webcamEnabled ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 500,
                height: "auto",
                aspectRatio: 16 / 9,
              }}
            >
              <Webcam
                ref={webcamRef}
                onUserMedia={() => setWebcamEnabled(true)}
                onUserMediaError={() => setWebcamEnabled(false)}
                mirrored={true}
                videoConstraints={{
                  width: 650,
                  height: 360,
                  facingMode: "user",
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 1,
                }}
                className="rounded-lg border-4 border-black"
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 2,
                }}
              />
            </div>
          ) : (
            <div className="flex justify-center flex-col w-5/6">
              <WebcamIcon className="h-72 w-full my-7 p-20 bg-secondary border border-gray-300 rounded-lg" />
              <div className="flex justify-center items-center">
                <Button
                  onClick={() => setWebcamEnabled(true)}
                  className="rounded-full "
                >
                  Enable WebCam and Microphone
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Start Interview Button */}
      <div className="flex justify-end items-end">
        <Button className="my-5" onClick={handleStartInterview}>
          Start Interview
        </Button>
      </div>
    </div>
  );
};

export default Interview;
