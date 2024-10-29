"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Mail, Phone, Linkedin, Instagram } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <div>
      <section className="relative h-screen">
        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute inset-0 object-cover w-full h-full"
          src="/background.mp4"
          autoPlay
          loop
          muted
        />
        {/* Overlay for fading effect */}
        <div className="absolute inset-0 bg-black opacity-80"></div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col justify-center items-center mx-auto max-w-screen-xl px-4 py-32 lg:h-screen text-center main-content">
          {/* 3D Illusion with Typing Effect */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white sm:leading-tight animate-typewriter">
            <span className="block animate-3dRotate">AI Mock Interview.</span>
            <strong className="font-extrabold text-gradient block mt-2 text-3dGlow">
              Empower Your Preparation.
            </strong>
          </h1>

          <p className="mt-4 sm:text-lg lg:text-xl text-white animate-fadeIn max-w-prose mx-auto">
            Get personalized, role-specific interview practice to boost your chances of success. Our platform provides tailored questions, real-time feedback, and interactive simulations to help you confidently showcase your skills.
          </p>

          <a
            className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-8 py-3 text-gray-900 hover:bg-transparent hover:text-white focus:outline-none focus:ring active:bg-white/90 mt-8 cursor-pointer animate-hoverEffect"
            onClick={() => router.push("/dashboard")}
          >
            <span className="text-sm font-medium"> Let's Get Started </span>
            <svg
              className="size-5 rtl:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        {/* Footer */}
        {/* <div className="absolute bottom-0 w-full bg-black bg-opacity-0 text-white py-4 z-10">
          <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-5">
              <a
                href="mailto:akashbalaji594@gmail.com"
                className="flex items-center gap-2 text-gray-300 hover:text-green-500 transition-colors duration-200 text-sm sm:text-base"
              >
                <Mail className="w-5 h-5" />
                <span>akashbalaji594@gmail.com</span>
              </a>
              <a
                href="tel:9345992436"
                className="flex items-center gap-2 text-gray-300 hover:text-green-500 transition-colors duration-200 text-sm sm:text-base"
              >
                <Phone className="w-5 h-5" />
                <span>9345992436</span>
              </a>
            </div>

            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <a
                href="https://www.linkedin.com/in/akash-b-a92b30230/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-green-500 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/akashak_45?igsh=dHQ4ZGF3MXU2OHZ0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-green-500 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div> */}
      </section>

      <style jsx>{`
        /* Typing Effect with 3D Illusion */
        .animate-typewriter {
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid #fff;
          animation: typing 3s steps(30, end), blink 0.5s step-end infinite alternate;
        }

        .animate-3dRotate {
          animation: rotate3D 4s infinite alternate ease-in-out;
          perspective: 1000px;
          transform-origin: center;
        }

        .text-gradient {
          background: linear-gradient(45deg, #00ff88, #ff0088, #0088ff);
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Fade In */
        .animate-fadeIn {
          animation: fadeIn 3s ease-out;
        }

        /* Hover Effect for Button */
        .animate-hoverEffect {
          animation: pulse 2s infinite;
        }

        /* Keyframes */
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes blink {
          50% { border-color: transparent; }
        }

        @keyframes rotate3D {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(10deg) rotateY(10deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Responsive Design for Small Screens */
        @media (max-width: 360px) {
          .main-content {
            justify-content: flex-start;
            padding-top: 2rem;
            overflow-y: auto;
          }
        }

        @media (max-height: 500px) {
          .main-content {
            height: 100vh;
            overflow-y: scroll;
          }
        }

        @media (max-width: 380px) {
          section {
            padding-bottom: 0;
          }
        }

        @media (max-width: 350px) {
          .relative.z-10 {
            padding-bottom: 5rem;
          }
        }
      `}</style>
    </div>
  );
}
