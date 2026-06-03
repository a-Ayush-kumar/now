## Virtual environment:

# create a virtual environment
python -m venv myenv

# activate myenv: 
myenv/scripts/activate

# deactivate myenv:
deactivate

## The very first step: Transcript extraction

transcript extraction method implemented with three fall back method i.e. the youtube-transcript-api -> yt-dlp for the fallback to youtube video and finally for instagram -> openai-whisper.
issue arised was the ffmpeg and ffprobe not locating the correct, engaged in the debugging the path
Finally able to generate the transcript.

chunk size is 1000 with overlap of 200