## noW - what is it?

noW is a web app that allow you to compare and analyze the perfomance of your short video independent of the platform. Although the feature is limited right now but soon you can have this full functionality.

## Aim

Basic aim while building is more accurate and low latency, allowing seamless exprience.

## Technology used

fot the backend, the tech used is the FastAPI (python version 3.13.13)
for the transcript generation, the choice is the youtube-transcript-api/ and for the instagram transcript the choice is wishper if required it is better option to go with yt-dlp in fallback case
<!-- still to be decided -->
for the orchestration, I wish to choose the langGraph but with the flow and time will choose it, till I will go with the langChain
for embedding, the choice is openAI
for vectorDB choice is chromaDB
for LLM the choice will be again I'll choose and go foreward with gemini

## How it works

For normal user, the flow is like the user comes and enter the url, i.e. the link of the video they wanna get insight of or compare for and then the agent comes in the action, once the agent perform its analytics, it generates the output and do another storage of the output or the store the conversation.

## Actual flow of the process

URL provided -> agent(the interface and the backend i.e. api) - extract the metadata directly from the endpoint -> get the transcript using the youtube-tanscript-api or wishper(for instagram) and yt-dlp in case of no transcript available for any video using youtube-transcript-api -> applying the vector search -> chunking the data (not decided the amount of chunk made but do it as per my requirement) -> embedding -> chromaDB(the vector database that is in use here as is cheapest and low load) -> (extraction of the data that I treat as metadata 2 why- because these metadata will not let me again do the whole process for the same url) -> use the langGraph (store the data and keywords) -> giving data to the LLM -> Response generated.

## Setup the codebase

First fork the repository and run:
cd frontend

Here I used the pnpm to add the dependency.
now Run:
pnpm install

to run the project run the command:
pnpm dev

for the backend setup: run
cd backend or move into the backend directory

<!-- need to complete it -->


<!-- frontend readme -->
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started With The chatApp - noW

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## What is noW

noW is a task for the SDE profile for implementing the comparision the analytics and the comparision of the two source working the video, mostlly helpful for the creator and everyone who want to grow on the social media.

## How it works

so you have an option to add your video/s i.e. the video that you want to compare or analyze it, now if you have any specific question about it, you can add your question and send it, the noW will analyze your request and then present the analytics

## Technical details about the app

The code environment used is Next.js, with tailwindCSS, and written in typescript. Taken the use of shadcn for ui components.

# Why these tech
Next.js - best option for the frontend and easy to maintain the dataflow, implementing the UI
Tailwind - best to implement the darkmode with the Next.js
Typescript - strictness allows me to stop me from making more mistake or make mistake
axios - to make the connection with the backend and allow seamless communication between the backend and the frontend.


## Dynamic Schema Matching via Pydantic: 

Configured a custom Pydantic validator (`@model_validator`) in the FastAPI gateway to dynamically parse incoming request bodies containing either `url` or `video_url`. This completely resolved HTTP `422 Unprocessable Entity` mismatches between client payloads and server schemas.

## Bypassed Broken SDK Wrappers with Direct REST Ingestion:

 Solved a critical SDK exception (`404 NOT_FOUND` routing bugs) by bypassing the unstable `langchain-google-genai` embedding wrapper layer. Reimplemented vector generation using a zero-dependency, direct HTTP POST architecture hitting Google’s native production endpoints.

## Multi-Video RAG via Metadata Filtering:
 Rewrote the retrieval pipeline from a single-video query engine to a multi-video analytical system. Configured dynamic logical mapping (`$or` operators) over Chroma DB metadata fields, restricting context search space precisely to the user's selected video subset (up to 3 links simultaneously).
## Empty-Audio Pipeline Resilience:

 Patched audio track extraction errors by writing an active string validation guard. If a video contains purely music or background scores without spoken words, the pipeline injects a clean contextual placeholder instead of throwing a `400 INVALID_ARGUMENT` API fault due to empty vector spaces.
## Corrected `faster-whisper` Runtime Syntax:

 Resolved core execution crashes in the locally hosted transcription module by mapping the specific tuple return values (`(segments, info)`) yielded by the `faster_whisper` engine.
# now
