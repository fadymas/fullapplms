import React, { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
import {
    FaPlay,
    FaPause,
    FaExpand,
    FaCompress,
    FaVolumeUp,
    FaVolumeMute,
    FaForward,
    FaBackward
} from 'react-icons/fa'
import '../styles/CustomVideoPlayer.css'

const CustomVideoPlayer = ({ url }) => {
    const playerRef = useRef(null)
    const playerContainerRef = useRef(null)
    const [playing, setPlaying] = useState(false)
    const [volume, setVolume] = useState(0.8)
    const [muted, setMuted] = useState(false)
    const [played, setPlayed] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [buffered, setBuffered] = useState(0)
    const [isReady, setIsReady] = useState(false)
    const [seeking, setSeeking] = useState(false)
    const controlsTimeoutRef = useRef(null)

    // Format time in MM:SS or HH:MM:SS
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '00:00'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = Math.floor(seconds % 60)
        if (h > 0) {
            return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
        }
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    // Handle play/pause
    const handlePlayPause = () => {
        setPlaying(!playing)
    }

    // Handle seeking - use seekTo with fraction (0-1)
    const handleSeekMouseDown = () => {
        setSeeking(true)
    }

    const handleSeekChange = (e) => {
        const newPlayed = parseFloat(e.target.value)
        setPlayed(newPlayed)
    }

    const handleSeekMouseUp = (e) => {
        setSeeking(false)
        const newPlayed = parseFloat(e.target.value)

        if (playerRef.current && isReady) {
            // In v3, use seekTo with fraction (0-1)
            playerRef.current.api.seekTo(newPlayed, 'fraction')
        }
    }

    // Handle volume change
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value)
        setVolume(newVolume)
        setMuted(newVolume === 0)
    }

    // Toggle mute
    const handleMuteToggle = () => {
        setMuted(!muted)
    }

    // Skip forward 10 seconds
    const handleSkipForward = () => {
        if (playerRef.current && isReady && duration > 0) {
            const currentTime = played
            const newTime = Math.min(currentTime + 10, duration)
            // seekTo accepts seconds directly
            playerRef.current.api.seekTo(newTime, 'seconds')
            setPlayed(newTime)

        }
    }

    // Skip backward 10 seconds
    const handleSkipBackward = () => {
        if (playerRef.current && isReady && duration > 0) {
            const currentTime = played
            const newTime = Math.max(currentTime - 10, 0)
            // seekTo accepts seconds directly
            playerRef.current.api.seekTo(newTime, 'seconds')
            setPlayed(newTime)
        }
    }

    // Toggle fullscreen
    const handleFullscreen = () => {
        const container = playerContainerRef.current
        if (!document.fullscreenElement) {
            container?.requestFullscreen?.() ||
                container?.webkitRequestFullscreen?.() ||
                container?.mozRequestFullScreen?.() ||
                container?.msRequestFullscreen?.()
        } else {
            document.exitFullscreen?.() ||
                document.webkitExitFullscreen?.() ||
                document.mozCancelFullScreen?.() ||
                document.msExitFullscreen?.()
        }
    }

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
        document.addEventListener('mozfullscreenchange', handleFullscreenChange)
        document.addEventListener('MSFullscreenChange', handleFullscreenChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
        }
    }, [])

    // Auto-hide controls
    const resetControlsTimeout = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }
        if (playing) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false)
            }, 3000)
        }
    }

    useEffect(() => {
        if (!playing) {
            setShowControls(true)
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
        } else {
            resetControlsTimeout()
        }
    }, [playing])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ignore if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return
            }

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault()
                    handlePlayPause()
                    break
                case 'arrowleft':
                    e.preventDefault()
                    handleSkipBackward()
                    break
                case 'arrowright':
                    e.preventDefault()
                    handleSkipForward()
                    break
                case 'm':
                    e.preventDefault()
                    handleMuteToggle()
                    break
                case 'f':
                    e.preventDefault()
                    handleFullscreen()
                    break
                default:
                    break
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [playing, played, duration, isReady, muted])

    return (
        <div
            ref={playerContainerRef}
            className={`custom-video-player ${isFullscreen ? 'fullscreen-mode' : ''}`}
            onMouseMove={resetControlsTimeout}
            onMouseLeave={() => playing && setShowControls(false)}
        >
            {/* Transparent overlay to prevent clicks on YouTube controls */}
            <div className="video-overlay" onClick={handlePlayPause} />

            {/* React Player */}
            <ReactPlayer
                ref={playerRef}
                src={url}
                playing={playing}
                volume={volume}
                muted={muted}
                width="100%"
                height="100%"
                onReady={() => {
                    setIsReady(true)
                }}
                playsInline={true}
                onPlaying={() => {
                    if (isReady) setDuration(playerRef.current.api.playerInfo.duration)

                }}

                onProgress={(s) => {
                    setPlayed(playerRef.current.api.playerInfo.currentTime)
                }}
                onError={(e) => console.error('Video player error:', e)}
                onEnded={() => { setPlayed(0) }}

                config={{
                    youtube: {
                        playerVars: {
                            controls: 0, // Hide YouTube controls
                            modestbranding: 1,
                            rel: 0,
                            fs: 0, // Disable YouTube fullscreen
                            disablekb: 1,
                        }
                    }
                }}
            />

            {/* Custom Controls */}
            <div className={`custom-controls ${showControls ? 'show' : 'hide'} `}>
                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-bar-bg">
                        <div className="buffered-bar" style={{ width: `${100}%` }} />
                        <div className="played-bar" style={{ width: `${(played / duration) * 100}%` }} />
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            step={0.001}
                            value={played}
                            onMouseDown={handleSeekMouseDown}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekMouseUp}
                            onTouchStart={handleSeekMouseDown}
                            onTouchEnd={handleSeekMouseUp}
                            className="seek-slider"
                        />
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="controls-bottom">
                    <div className="controls-left">
                        {/* Play/Pause */}
                        <button className="control-btn" onClick={handlePlayPause}>
                            {playing ? <FaPause /> : <FaPlay />}
                        </button>

                        {/* Skip Backward */}
                        <button className="control-btn" onClick={handleSkipBackward} title="رجوع 10 ثواني">
                            <FaBackward />
                            <span className="skip-text">10</span>
                        </button>

                        {/* Skip Forward */}
                        <button className="control-btn" onClick={handleSkipForward} title="تقدم 10 ثواني">
                            <FaForward />
                            <span className="skip-text">10</span>
                        </button>

                        {/* Volume */}
                        <div className="volume-control">
                            <button className="control-btn" onClick={handleMuteToggle}>
                                {muted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={muted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                            />
                        </div>

                        {/* Time Display */}
                        <div className="time-display">
                            <span>{formatTime(played)}</span>
                            <span className="time-separator">/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="controls-right">
                        {/* Fullscreen */}
                        <button className="control-btn" onClick={handleFullscreen} title="ملء الشاشة">
                            {isFullscreen ? <FaCompress /> : <FaExpand />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Center Play Button (when paused) */}
            {!playing && (
                <div className="center-play-btn" onClick={handlePlayPause}>
                    <FaPlay />
                </div>
            )}
        </div>
    )
}

export default CustomVideoPlayer