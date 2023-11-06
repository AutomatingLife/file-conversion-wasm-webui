const { fetchFile } = FFmpegUtil;
const { FFmpeg } = FFmpegWASM;
let ffmpeg = null;

const transcode = async () => {
    const uploader = document.getElementById('uploader');
    const message = document.getElementById('message');
    const output_file = document.getElementById('output_file').value;
    const options = {
        "-f": { "name": "force_format", "description": "force format", "type": "text" },
        "-c": { "name": "codec_name", "description": "codec name", "type": "text" },
        "-b": { "name": "file_bitrate", "description": "file bitrate", "type": "number" },
        "-t": { "name": "duration", "description": "record or transcode 'duration' seconds of audio/video", "type": "number" },
        "-to": { "name": "time_stop", "description": "record or transcode stop time", "type": "text" },
        "-fs": { "name": "limit_size", "description": "set the limit file size in bytes", "type": "number" },
        "-ss": { "name": "start_time_offset", "description": "set the start time offset", "type": "number" },
        "-sseof": { "name": "start_time_offset_relative_to_eof", "description": "set the start time offset relative to EOF", "type": "number" },
        "-timestamp": { "name": "recording_timestamp", "description": "set the recording timestamp ('now' to set the current time)", "type": "text" },
        "-target": { "name": "target", "description": "specify target file type (\"vcd\", \"svcd\", \"dvd\", \"dv\" or \"dv50\" with optional prefixes \"pal-\", \"ntsc-\" or \"film-\")", "type": "text" },
        "-preset": { "name": "preset", "description": "set the encoding preset.", "type": "text" },
        "-vf": { "name": "video_filter", "description": "set video filters", "type": "string" },
        "-vframes": { "name": "number_of_video_frames", "description": "set the number of video frames to output", "type": "number" },
        "-r": { "name": "frame_rate", "description": "set frame rate (Hz value, fraction or abbreviation)", "type": "text" },
        "-fpsmax": { "name": "max_frame_rate", "description": "set max frame rate (Hz value, fraction or abbreviation)", "type": "text" },
        "-s": { "name": "frame_size", "description": "set frame size (WxH or abbreviation)", "type": "text" },
        "-aspect": { "name": "aspect_ratio", "description": "set aspect ratio (4:3, 16:9 or 1.3333, 1.7777)", "type": "text" },
        "-c:v": { "name": "force_video_codec", "description": "force video codec ('copy' to copy stream)", "type": "text" },
        "-b:v": { "name": "video_bitrate", "description": "video bitrate", "type": "number" },
        "-display_rotation": { "name": "pure_counter_clockwise_rotation", "description": "set pure counter-clockwise rotation in degrees for stream(s)", "type": "number" },
        "-vn": { "name": "disable_video", "description": "disable video", "type": "boolean" },
        "-aframes": { "name": "number_of_audio_frames", "description": "set the number of audio frames to output", "type": "number" },
        "-aq": { "name": "audio_quality", "description": "set audio quality (codec-specific)", "type": "text" },
        "-ar": { "name": "audio_sampling_rate", "description": "set audio sampling rate (in Hz)", "type": "number" },
        "-ac": { "name": "number_of_audio_channels", "description": "set number of audio channels", "type": "number" },
        "-an": { "name": "disable_audio", "description": "disable audio", "type": "boolean" },
        "-acodec": { "name": "force_audio_codec", "description": "force audio codec ('copy' to copy stream)", "type": "text" },
        "-b:a": { "name": "audio_bitrate", "description": "audio bitrate", "type": "number" },
        "-af": { "name": "audio_filter", "description": "set audio filter", "type": "string" }
    }
    if (ffmpeg === null) {
        ffmpeg = new FFmpeg();
        ffmpeg.on("log", ({ message }) => {
            console.log(message);
        })
        ffmpeg.on("progress", ({ progress, time }) => {
            message.innerHTML = `${progress * 100}%, time: ${time / 1000000}s`;
        });
        await ffmpeg.load({
            coreURL: "/assets/core/package/dist/umd/ffmpeg-core.js",
        });
    }

    const files = uploader.files;
    if (files.length === 0) {
        message.innerHTML = 'No file selected.';
        return;
    }

    const { name } = files[0];
    await ffmpeg.writeFile(name, await fetchFile(files[0]));
    message.innerHTML = 'Start transcoding';
    console.time('exec');
    let args = [];
    console.log(options)
    for (const element in options) {
        let name = options[element].name;
        let value = document.getElementById(name).value;
        if (value !== "" && value != null && document.getElementById(name).type !== "checkbox") {
            args.push(element);
            args.push(value)
        } else if (document.getElementById(name).type === "checkbox" && document.getElementById(name).checked && !name.includes("flip")) {
            args.push(element);
        }
    }
    console.log("ffmpeg -i " + name + " " + args.join(" ") + " " + output_file)
    await ffmpeg.exec(['-i', name, ...args, output_file]);
    console.timeEnd('exec');
    message.innerHTML = 'Complete transcoding';

    const data = await ffmpeg.readFile(output_file);
    const video = document.getElementById('output-video');
    video.src = URL.createObjectURL(new Blob([data.buffer]));
};

const transcodeButton = document.getElementById('transcode-btn');
transcodeButton.addEventListener('click', transcode);