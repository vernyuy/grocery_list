import React, { useEffect, useRef, useState } from "react";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import { onStripePaymentLinkResponse } from "./graphql/subscriptions";
const client = generateClient();
interface SpinnerProps {
  height?: string;
}
interface Card {
  id: number;
  content: string;
  icon: JSX.Element;
}

interface ParsedData {
  documentType: string;
  documentId: string;
  documentStatus: string;
  documentName: string;
  id: string;
  documentSize: string;
  createdOn: string;
  userId: string;
}

const Spinner: React.FC<SpinnerProps> = ({ height = "16px" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="animate-spin"
      style={{ height }} // Use the height prop to dynamically set the height.
    >
      <g>
        <circle cx="12" cy="2.5" r="1.5" fill="currentColor" opacity=".14" />
        <circle
          cx="16.75"
          cy="3.77"
          r="1.5"
          fill="currentColor"
          opacity=".29"
        />
        <circle
          cx="20.23"
          cy="7.25"
          r="1.5"
          fill="currentColor"
          opacity=".43"
        />
        <circle cx="21.5" cy="12" r="1.5" fill="currentColor" opacity=".57" />
        <circle
          cx="20.23"
          cy="16.75"
          r="1.5"
          fill="currentColor"
          opacity=".71"
        />
        <circle
          cx="16.75"
          cy="20.23"
          r="1.5"
          fill="currentColor"
          opacity=".86"
        />
        <circle cx="12" cy="21.5" r="1.5" fill="currentColor" />
        <animateTransform
          attributeName="transform"
          calcMode="discrete"
          dur="0.75s"
          repeatCount="indefinite"
          type="rotate"
          values="0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"
        />
      </g>
    </svg>
  );
};

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setprocessing] = useState(false);
  const [state, setState] = useState<ParsedData[]>([]);
  const uploadProgressRef = useRef(0);
  const fileRef = useRef<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const parseDataString = (dataString: string): ParsedData => {
    const regex = /(\w+)=\{(S|N)=(.*?)\}/g;
    const parsedData: ParsedData = {
      documentType: "",
      documentId: "",
      documentStatus: "",
      documentName: "",
      id: "",
      documentSize: "",
      createdOn: "",
      userId: "",
    };
    let match;
    while ((match = regex.exec(dataString)) !== null) {
      const key = match[1];
      const value = match[3];
      if (key in parsedData) {
        parsedData[key as keyof ParsedData] = value;
      }
    }
    return parsedData;
  };

  useEffect(() => {
    client
      .graphql({
        query: onStripePaymentLinkResponse,
      })
      .subscribe({
        next: ({ data }) => {
          const parsedData = parseDataString(
            data.onStripePaymentLinkResponse.data
          );

          if (fileRef.current?.name === parsedData.documentName) {
            setprocessing(false);
          }

          setState((prevState) => {
            // Check if the userId already exists in the state
            const existingIndex = prevState.findIndex(
              (item) => item.id === parsedData.id
            );

            if (existingIndex !== -1) {
              // If userId exists, update the corresponding item
              const updatedState = [...prevState];
              updatedState[existingIndex] = {
                ...updatedState[existingIndex],
                ...parsedData,
              };
              return updatedState;
            } else {
              // If userId doesn't exist, add the new data
              return [...prevState, parsedData];
            }
          });
        },
        error: (error) => console.warn("==== errr", error),
      });
  }, []);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFile(file || null);
    fileRef.current = file || null;
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      setFile(files[0]);
      fileRef.current = file || null;
    }
  };

  const uploadToS3 = async () => {
    if (file) {
      setLoading(true);
      uploadProgressRef.current = 0.1;
      setUploadProgress(0.1);
      try {
        const result = await uploadData({
          path: file.name!,
          data: file,
          options: {
            onProgress: ({ transferredBytes, totalBytes }) => {
              if (totalBytes) {
                const progress = Math.round(
                  (transferredBytes / totalBytes) * 100
                );
                uploadProgressRef.current = progress;
                setUploadProgress(progress);
              }
              if (uploadProgressRef.current === 100) {
                uploadProgressRef.current = 0;
                setUploadProgress(0);
                setLoading(false);
                setprocessing(true);
              }
            },
          },
        }).result;
        console.log("Succeeded:", result);
      } catch (error) {
        console.log("Error:", error);
      }
      setLoading(false);
    }
  };

  const cards: Card[] = [
    {
      id: 1,
      content: "Write a to-do list for a personal project or task",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-5"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          >
            <path d="M19.727 20.447c-.455-1.276-1.46-2.403-2.857-3.207S13.761 16 12 16s-3.473.436-4.87 1.24s-2.402 1.931-2.857 3.207" />
            <circle cx="12" cy="8" r="4" />
          </g>
        </svg>
      ),
    },
    {
      id: 2,
      content: "Generate an email to reply to a job offer",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-5"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="m2.357 7.714l6.98 4.654c.963.641 1.444.962 1.964 1.087c.46.11.939.11 1.398 0c.52-.125 1.001-.446 1.964-1.087l6.98-4.654M7.157 19.5h9.686c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.31-1.311c.328-.642.328-1.482.328-3.162V9.3c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311c-.642-.327-1.482-.327-3.162-.327H7.157c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.31 1.311c-.328.642-.328 1.482-.328 3.162v5.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311c.642.327 1.482.327 3.162.327"
          />
        </svg>
      ),
    },
    {
      id: 3,
      content: "Summarize this article or text for me in one paragraph",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5"
          viewBox="-2 -2.5 24 24"
        >
          <path
            fill="currentColor"
            d="M3.656 17.979A1 1 0 0 1 2 17.243V15a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8.003zm.844-3.093a.54.54 0 0 0 .26-.069l2.355-1.638A1 1 0 0 1 7.686 13H12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5c0 .54.429.982 1 1c.41.016.707.083.844.226c.128.134.135.36.156.79c.003.063.003.177 0 .37a.5.5 0 0 0 .5.5m11.5-4.87a7 7 0 0 0 0 .37zc.02-.43.028-.656.156-.79c.137-.143.434-.21.844-.226c.571-.018 1-.46 1-1V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1H5V2a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2v2.243a1 1 0 0 1-1.656.736L16 13.743z"
          />
        </svg>
      ),
    },
    {
      id: 4,
      content: "How does AI work in a technical capacity",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5"
          viewBox="0 0 1024 1024"
        >
          <path
            fill="currentColor"
            d="M912 192H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8m0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8m0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8M104 228a56 56 0 1 0 112 0a56 56 0 1 0-112 0m0 284a56 56 0 1 0 112 0a56 56 0 1 0-112 0m0 284a56 56 0 1 0 112 0a56 56 0 1 0-112 0"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center pt-16 md:pt-24 px-4">
      <div className="w-full max-w-screen-md">
        <div className="font-semibold text-2xl md:text-4xl bg-gradient-to-r from-black via-purple-800 to-purple-500 text-transparent bg-clip-text">
          <h1>Hi there, Ro</h1>
          <h1>What can i do for you today ?</h1>
        </div>

        <div className="py-3 text-gray-600 text-sm">
          <p>
            Use one of the most common prompts <br />
            below or use your own to begin
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
          {cards.map((card) => (
            <div
              key={card.id}
              className="border border-gray-300 rounded-xl p-4 relative w-full min-h-28 md:min-h-32"
            >
              <div className="text-[12px] font-semibold leading-[15px] mb-5">
                <p>{card.content}</p>
              </div>
              <div className="absolute bottom-4 text-gray-500">{card.icon}</div>
            </div>
          ))}
        </div>

        {state &&
          state.length > 0 &&
          state.map((item, index) => (
            <div key={index} className="pt-5 text-purple-600 uppercase text-sm">
              <p>
                <span className="capitalize">document name: </span>
                {item.documentName}
              </p>
              <div className="inline-flex items-center pt-1">
                <p className="pr-2">
                  <span className="capitalize">document status: </span>
                  <span className="font-black">{item.documentStatus}</span>
                </p>
                {item.documentStatus != "COMPLETED" && <Spinner />}
              </div>
            </div>
          ))}

        {processing && (
          <div className="pt-3 text-purple-600 inline-flex items-center gap-1">
            <Spinner /> Loading...
          </div>
        )}

        <div
          className={`flex items-center justify-start text-gray-600 gap-1.5 text-sm font-medium pt-3 cursor-pointer transition duration-200 ease-in-out transform active:scale-95 ${
            uploadProgress <= 0 && "mb-5"
          }`}
          onClick={() => window.location.reload()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4"
            viewBox="0 0 1024 1024"
          >
            <path
              fill="currentColor"
              d="M771.776 794.88A384 384 0 0 1 128 512h64a320 320 0 0 0 555.712 216.448H654.72a32 32 0 1 1 0-64h149.056a32 32 0 0 1 32 32v148.928a32 32 0 1 1-64 0v-50.56zM276.288 295.616h92.992a32 32 0 0 1 0 64H220.16a32 32 0 0 1-32-32V178.56a32 32 0 0 1 64 0v50.56A384 384 0 0 1 896.128 512h-64a320 320 0 0 0-555.776-216.384z"
            />
          </svg>
          <p>Refresh props</p>
        </div>

        {uploadProgress > 0 && (
          <div className="relative flex items-center px-3 pt-5 mb-2">
            <div className="relative w-full h-1.5 overflow-hidden rounded-3xl bg-gray-100">
              <div
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: `${uploadProgress}%` }}
                className="flex h-full items-center justify-center bg-gradient-to-r from-black via-purple-800 to-purple-500 text-transparent text-white rounded-3xl"
              ></div>
            </div>
            <span className="ml-2 rounded-full text-gray-800 text-xs font-medium flex justify-center items-center">
              {uploadProgress}%
            </span>
          </div>
        )}

        <div className="w-full mb-5 cursor-pointer transition duration-200 ease-in-out transform active:scale-95">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center py-9 w-full border border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="mb-3 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
              >
                <g id="Upload 02">
                  <path
                    id="icon"
                    d="M16.296 25.3935L19.9997 21.6667L23.7034 25.3935M19.9997 35V21.759M10.7404 27.3611H9.855C6.253 27.3611 3.33301 24.4411 3.33301 20.8391C3.33301 17.2371 6.253 14.3171 9.855 14.3171V14.3171C10.344 14.3171 10.736 13.9195 10.7816 13.4326C11.2243 8.70174 15.1824 5 19.9997 5C25.1134 5 29.2589 9.1714 29.2589 14.3171H30.1444C33.7463 14.3171 36.6663 17.2371 36.6663 20.8391C36.6663 24.4411 33.7463 27.3611 30.1444 27.3611H29.2589"
                    stroke="#4F46E5"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>

            <h2 className="text-center text-gray-400 text-xs font-normal leading-4 mb-1">
              PDF's, Audios or Videos
            </h2>
            <h4 className="text-center text-gray-900 text-sm font-medium leading-6">
              {file ? file.name : "Drag file here or click to upload"}
            </h4>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={onChange}
              accept=".pdf, audio/*, video/*"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={uploadToS3}
          disabled={loading || !file}
          className={`w-full inline-flex items-center justify-center gap-1 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
            loading || !file
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300"
          }`}
        >
          {loading && <Spinner />}
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default App;
