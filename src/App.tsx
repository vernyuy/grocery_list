import React, { useEffect, useRef, useState } from "react";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import { onStripePaymentLinkResponse } from "./graphql/subscriptions";
const client = generateClient();
interface SpinnerProps {
  height?: string;
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
  const [state, setState] = useState<{
    intro: string;
    products: string[];
    closing: string;
  }>({
    intro: "",
    products: [],
    closing: "",
  });
  const [link, setLink] = useState<string>("");
  const uploadProgressRef = useRef(0);
  const fileRef = useRef<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  function parseMessage(msg: string) {
    // Match the product section (everything between the first dash and "You can" or end)
    const productSectionMatch = msg.match(/- .+?(?=You can|$)/s);

    // Get the start of the message (before the first product)
    const intro = msg.split("-")[0].trim();

    // Get the end of the message (after "You can")
    const closingIndex = msg.indexOf("You can");
    const closing = closingIndex !== -1 ? msg.slice(closingIndex).trim() : "";

    // Extract product list
    let products: string[] = [];
    if (productSectionMatch) {
      products = productSectionMatch[0]
        .split("-")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    return {
      intro,
      products,
      closing,
    };
  }

  useEffect(() => {
    client
      .graphql({
        query: onStripePaymentLinkResponse,
      })
      .subscribe({
        next: ({ data }) => {
          const msg = data.onStripePaymentLinkResponse.data;
          // Remove known phrase and trim
          let cleanedMsg = msg.replace("You can access it here:", "").trim();

          // Remove starting and ending quotes (single or double)
          cleanedMsg = cleanedMsg.replace(/^["']+|["']+$/g, "");

          const match = cleanedMsg.match(/https?:\/\/[^\s]+/);
          if (match) {
            const url = match[0];
            const cleanText = cleanedMsg
              .replace(url, "")
              .trim()
              .replace(/\s*[: ]*\s*$/, "");

            const { intro, products, closing } = parseMessage(cleanText);

            setState({ intro, products, closing });
            setLink(url);
          }
          setprocessing(false);
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
        await uploadData({
          path: file.name!,
          data: file,
          options: {
            bucket: {
              bucketName:
                "apilambdas3sfnstack-grocerylistbucketbea68934-kxh1j5xtckid",
              region: "us-east-1",
            },
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
      } catch (error) {
        console.log("Error:", error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center pt-16 md:pt-24 px-4">
      <div className="w-full max-w-screen-md">
        <div
          className={`font-semibold text-2xl  md:text-3xl ${
            state.intro || link ? " mb-3" : " mb-7"
          } bg-gradient-to-r from-black via-purple-800 to-purple-500 text-transparent bg-clip-text`}
        >
          <h1>Grocery List with Stripe</h1>
        </div>
        {(state.intro || link) && (
          <div className="py-3 text-sm mb-2">
            <p>
              {state.intro}
              <br />
              <br />
              <ul className="list-disc pl-4">
                {state.products.map((product) => (
                  <li>{product}</li>
                ))}
              </ul>
              <br />
              {state.closing}
              <br />
              <br />
              <strong>Payment Link:</strong>{" "}
              <a
                href={link.replace("This", "")}
                target="_blank"
                className="text-purple-600"
              >
                {link.replace("This", "")}
              </a>
            </p>
          </div>
        )}

        {processing && (
          <div className="pb-3 text-purple-600 inline-flex items-center gap-1">
            <Spinner /> Loading...
          </div>
        )}

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
              PDF's and Images
            </h2>
            <h4 className="text-center text-gray-900 text-sm font-medium leading-6">
              {file ? file.name : "Drag file here or click to upload"}
            </h4>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={onChange}
              accept=""
            />
          </label>
        </div>

        <button
          type="button"
          onClick={uploadToS3}
          disabled={loading || !file || processing}
          className={`w-full inline-flex items-center justify-center gap-1 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
            loading || !file || processing
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
