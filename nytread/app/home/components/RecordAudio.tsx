"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, FC } from "react";
import { useRouter } from "next/navigation";
import { useSectionData } from "../../contexts/SectionContext";

interface RecordAudioProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  direction?: "section" | "article";
}

const ReactMediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  { ssr: false }
);

export const RecordAudio = ({
  isRecording,
  setIsRecording,
}: RecordAudioProps) => {
  const [recording, setRecording] = useState<string>("");
  const [transcription, setTranscription] = useState<string>("");
  const { setArticles } = useSectionData();
  const router = useRouter();

  const handleStopRecording = async (blobUrl: string, blob: Blob) => {
    setRecording(blobUrl);

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result as string;

      try {
        const response = await fetch("/openAI/api/category/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audioBase64: base64data }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTranscription(data.transcription);
        setArticles(data);
        router.push("/section");
      } catch (error) {
        console.error("Error sending audio to server:", error);
      }
    };
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Audio Recorder</h1>

      <ReactMediaRecorder
        audio
        onStop={handleStopRecording}
        render={({ status, startRecording, stopRecording }) => (
          <>
            <p>Status: {status}</p>
            <button
              className={`px-4 py-2 rounded ${isRecording ? "bg-red-500" : "bg-blue-500"} text-white`}
              onClick={() => {
                if (isRecording) {
                  stopRecording();
                  setIsRecording(false);
                } else {
                  startRecording();
                  setIsRecording(true);
                }
              }}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>

            {recording && <audio src={recording} controls />}

            <div className="mt-4">
              <h2 className="text-lg font-bold mb-2">Transcription:</h2>
              <pre className="p-4 bg-gray-200 text-black rounded">
                {transcription}
              </pre>
            </div>
          </>
        )}
      />
    </div>
  );
};
