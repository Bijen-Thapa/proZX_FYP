import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

function AudioPlayer({ audioUrl, title, artist }) {
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#A8A8A8',
            progressColor: '#1E40AF',
            cursorColor: '#606060',
            barWidth: 2,
            barGap: 1,
            responsive: true,
            height: 80,
            normalize: true,
        });

        wavesurfer.current.load(audioUrl);

        wavesurfer.current.on('ready', () => {
            setDuration(wavesurfer.current.getDuration());
        });

        wavesurfer.current.on('audioprocess', () => {
            setCurrentTime(wavesurfer.current.getCurrentTime());
        });

        wavesurfer.current.on('finish', () => {
            setIsPlaying(false);
        });

        return () => wavesurfer.current.destroy();
    }, [audioUrl]);

    const handlePlayPause = () => {
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-4">
                <h3 className="text-lg font-semibold flex-1">{title}</h3>
                {artist && <p className="text-gray-600">{artist}</p>}
            </div>

            <div className="relative">
                <div ref={waveformRef} className="w-full" />
                
                <div className="flex items-center justify-between mt-2">
                    <button
                        onClick={handlePlayPause}
                        className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    <div className="flex-1 mx-4">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                        <button className="p-2 text-gray-600 hover:text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AudioPlayer;