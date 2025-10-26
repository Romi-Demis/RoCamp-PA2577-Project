import React from "react";
import { Dialog } from "@headlessui/react";
import { X, Play, Maximize2 } from "lucide-react";
import { Lesson } from "../types";

interface VideoModalProps {
  lesson: Lesson | null;
  onClose: () => void;
}

function getYouTubeVideoId(url: string) {
  // Handle various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function VideoModal({ lesson, onClose }: VideoModalProps) {
  const [isReady, setIsReady] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleFullscreen = () => {
    if (iframeRef.current?.requestFullscreen) {
      iframeRef.current.requestFullscreen();
    }
  };

  React.useEffect(() => {
    // Reset ready state when lesson changes
    setIsReady(false);

    // Set a small timeout to allow the iframe to mount
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [lesson]);

  if (!lesson) return null;

  const videoId = lesson.video_url ? getYouTubeVideoId(lesson.video_url) : null;

  return (
    <Dialog open={!!lesson} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gray-900 w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gray-800">
            <Dialog.Title className="text-xl font-bold text-white">
              {lesson.title}
            </Dialog.Title>
            <div className="flex gap-2">
              {videoId && (
                <button
                  onClick={handleFullscreen}
                  aria-label="Fullscreen"
                  className="text-gray-300 hover:text-white p-1"
                >
                  <Maximize2 size={20} />
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="text-gray-300 hover:text-white p-1"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="aspect-video bg-black relative">
            {videoId ? (
              <>
                {!isReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="animate-pulse text-white" size={48} />
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className={`absolute inset-0 ${
                    isReady ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setIsReady(true)}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-6">
                <Play size={48} className="mb-4" />
                <p>No playable video available</p>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
