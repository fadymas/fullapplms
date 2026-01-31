// src/components/course/VideoPlayer.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FaTimes, FaPlay, FaPause, FaVolumeUp, FaExpand, FaCompress } from 'react-icons/fa';

const VideoPlayer = ({ show, handleClose, videoId, title }) => {
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(50);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (show && !player) {
            // في التطبيق الحقيقي، يمكن استخدام YouTube Player API
            // هذا نموذج محاكاة
            
            // محاكاة تحميل الفيديو
            setTimeout(() => {
                setDuration(3600); // ساعة واحدة
                setCurrentTime(0);
            }, 500);
        }
    }, [show, player, videoId]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        // هنا يمكن إضافة منطق للتحكم في مشغل الفيديو
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
        setVolume(isMuted ? 50 : 0);
    };

    const handleTimeChange = (e) => {
        const newTime = parseInt(e.target.value);
        setCurrentTime(newTime);
    };

    const handleFullscreen = () => {
        const videoContainer = document.querySelector('.video-container');
        if (!isFullscreen) {
            if (videoContainer.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if (videoContainer.webkitRequestFullscreen) {
                videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.msRequestFullscreen) {
                videoContainer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return hours > 0 
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            : `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose}
            centered
            size="lg"
            className="video-modal"
        >
            <Modal.Header className="border-0 pb-0">
                <Modal.Title>{title}</Modal.Title>
                <button 
                    className="btn btn-sm btn-outline-secondary border-0"
                    onClick={handleClose}
                >
                    <FaTimes />
                </button>
            </Modal.Header>
            
            <Modal.Body className="p-0">
                <div className="video-container">
                    {/* مكان الفيديو - يمكن استبداله بمشغل حقيقي */}
                    <div className="video-placeholder">
                        <div className="placeholder-content text-center">
                            <FaPlay className="play-icon" />
                            <p>مشغل الفيديو</p>
                            <small className="text-muted">(هذا نموذج محاكاة)</small>
                        </div>
                    </div>
                    
                    {/* عناصر التحكم */}
                    <div className="video-controls">
                        {/* شريط التقدم */}
                        <div className="progress-bar-container">
                            <input 
                                type="range" 
                                min="0" 
                                max={duration}
                                value={currentTime}
                                onChange={handleTimeChange}
                                className="progress-bar"
                            />
                            <div className="time-display">
                                <span>{formatTime(currentTime)}</span>
                                <span> / </span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>
                        
                        {/* أزرار التحكم */}
                        <div className="control-buttons">
                            <button 
                                className="btn btn-sm btn-outline-light"
                                onClick={handlePlayPause}
                            >
                                {isPlaying ? <FaPause /> : <FaPlay />}
                            </button>
                            
                            <div className="volume-control">
                                <button 
                                    className="btn btn-sm btn-outline-light"
                                    onClick={handleMuteToggle}
                                >
                                    <FaVolumeUp />
                                </button>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="volume-slider"
                                />
                            </div>
                            
                            <button 
                                className="btn btn-sm btn-outline-light"
                                onClick={handleFullscreen}
                            >
                                {isFullscreen ? <FaCompress /> : <FaExpand />}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            
            <Modal.Footer className="border-0 pt-0">
                <small className="text-muted">
                    جودة الفيديو: 1080p • سرعة الإنترنت: جيدة
                </small>
            </Modal.Footer>
        </Modal>
    );
};

export default VideoPlayer;