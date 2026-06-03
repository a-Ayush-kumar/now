import os
import re
import traceback
import requests
from faster_whisper import WhisperModel
import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi

os.environ["PATH"] += os.pathsep + r"C:\ffmpeg\bin"

TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)

# Using cpu fallback configuration safely
model = WhisperModel("base", device="cpu", compute_type="int8")

def is_youtube_url(url: str) -> bool:
    return "youtube.com" in url or "youtu.be" in url

def extract_video_id(url: str) -> str:
    pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(pattern, url)
    if not match:
        raise ValueError("Invalid YouTube URL")
    return match.group(1)

# Method 1: youtube-transcript-api
def get_transcript_api(video_id: str) -> str:
    transcript = YouTubeTranscriptApi.fetch_transcript(video_id)
    return " ".join(segment['text'] for segment in transcript)

# Method 2: yt-dlp subtitles
def get_ytdlp_subtitles(video_url: str) -> str:
    ydl_opts = {
        "writesubtitles": True,
        "writeautomaticsub": True,
        "skip_download": True,  
        "subtitleslangs": ["en"],
        "outtmpl": f"{TEMP_DIR}/%(id)s.%(ext)s",
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        subtitles = info.get("subtitles") or info.get("automatic_captions")

        if not subtitles:
            raise Exception("No subtitles available")

        for lang, subs in subtitles.items():
            if lang.startswith("en"):
                subtitle_url = subs[0]["url"]
                response = requests.get(subtitle_url)
                response.raise_for_status()
                return response.text

    raise Exception("English subtitles not found")

# Method 3: Whisper (Fixed Extensions & Iteration)
def get_whisper_transcript(video_url: str) -> str:
    # Explicitly track the final mp3 file output path
    audio_path = os.path.join(TEMP_DIR, "audio.mp3")
    
    # Remove old residual files if they exist to prevent locking bugs
    if os.path.exists(audio_path):
        os.remove(audio_path)
        
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(TEMP_DIR, "audio"), # base name
        "quiet": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
    }

    print("Downloading audio from URL...")
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    try:
        print("Transcribing audio with faster-whisper...")
        # faster-whisper returns an iterator tuple (segments, info)
        segments, info = model.transcribe(audio_path, beam_size=5)
        
        # Pull text directly out of the segment objects
        transcript_text = " ".join(segment.text for segment in segments)
        return transcript_text

    except Exception:
        print("\n===== faster-WHISPER TRACEBACK =====")
        traceback.print_exc()
        print("=============================\n")
        raise

def generate_transcript(video_url: str) -> str:
    # Only try YouTube-specific APIs for actual YouTube links
    if is_youtube_url(video_url):
        try:
            print("Trying youtube-transcript-api...")
            video_id = extract_video_id(video_url)
            return get_transcript_api(video_id)
        except Exception as e:
            print("youtube-transcript-api failed:", e)

        try:
            print("Trying yt-dlp subtitles...")
            return get_ytdlp_subtitles(video_url)
        except Exception as e:
            print("yt-dlp subtitles failed:", e)

    # Instagram links fall straight through directly to Whisper extraction 
    try:
        print("Trying Whisper...")
        return get_whisper_transcript(video_url)
    except Exception as e:
        print("Whisper failed:", e)

    raise Exception("Unable to generate transcript")