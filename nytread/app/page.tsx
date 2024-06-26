"use client";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import openerLoading from "../public/opener-loading.json";
import recordingAnimation from "../public/record-ltcopyrmod1.json";

const Lottie = dynamic(() => import("react-lottie-player"), { ssr: false });
const RecordAudio = dynamic(
  () => import("./components/AudioRecorder").then((mod) => mod.AudioRecorder),
  {
    ssr: false,
  }
);

export default function LoginPage() {
  const [audioUrl, setAudioUrl] = useState<string>("/login.mp3");
  const [animate, setAnimate] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loginSuccessful, setLoginSuccessful] = useState(false);
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleClick = () => {
    // Toggle recording state
    if (!isRecording) {
      audioRef.current?.pause();
      setIsRecording(true);
      setAnimate(true);
    } else {
      setIsRecording(false);
      setAudioUrl("/recordingEnded.mp3");
      audioRef.current?.play();
      setAnimate(false);
    }
  };

  const handleAudioBlob = async (blob: Blob) => {
    setIsRecording(false);
    setAnimate(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64data = reader.result as string;

      try {
        const response = await fetch("/api/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ audioBase64: base64data }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data, "data");
        if (data.isValid) {
          setLoginSuccessful(data.isValid);
        }
      } catch (error) {
        console.error("Error processing audio:", error);
        setLoginSuccessful(false);
      }
    };
    reader.readAsDataURL(blob);
  };

  // const { status, startRecording, stopRecording, mediaBlobUrl } =
  //   useReactMediaRecorder({
  //     video: false,
  //     onStop: (blobUrl, blob) => {
  //       handleAudioBlob(blob);
  //     },
  //   });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("ended", () => {
        if (loginSuccessful) {
          router.push("/home");
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", () => {
          if (loginSuccessful) {
            router.push("/home");
          }
        });
      }
    };
  }, [loginSuccessful, router]);

  return (
    <main>
      <div className="bg-slate-500 h-screen w-screen" onClick={handleClick}>
        <div className="aspect-w-1 aspect-h-1 w-full h-full">
          <Lottie
            animationData={isRecording ? recordingAnimation : openerLoading}
            play={animate}
            style={{ width: "90vw", height: "90vh" }}
            loop={true}
          />
          <RecordAudio
            onBlobReady={handleAudioBlob}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
          <audio ref={audioRef} src={audioUrl} autoPlay hidden />
        </div>
      </div>
    </main>
  );
}
