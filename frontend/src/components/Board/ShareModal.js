import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose }) => {
    const [isPublic, setIsPublic] = useState(false);
    const [publicId, setPublicId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const { user } = useContext(AuthContext);

    const publicUrl = `${window.location.origin}/public/${publicId}`;

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setError('');
            setCopySuccess('');
            axios.get('/api/board/share', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => {
                setIsPublic(res.data.isPublic);
                setPublicId(res.data.publicId || '');
                setIsLoading(false);
            })
            .catch(err => {
                setError('Could not fetch sharing status. Please try again.');
                setIsLoading(false);
            });
        }
    }, [isOpen]);

    const handleToggleShare = () => {
        setIsLoading(true);
        setError('');
        axios.post('/api/board/share', {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => {
            setIsPublic(res.data.isPublic);
            setPublicId(res.data.publicId || '');
            setIsLoading(false);
        })
        .catch(err => {
            setError('Could not update sharing status. Please try again.');
            setIsLoading(false);
        });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicUrl).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button onClick={onClose} className="close-button">&times;</button>
                <h2>Share Board</h2>
                {error && <p className="error-message">{error}</p>}
                
                <div className="toggle-container">
                    <span>Make Board Publicly Viewable</span>
                    <label className="switch">
                        <input type="checkbox" checked={isPublic} onChange={handleToggleShare} disabled={isLoading} />
                        <span className="slider round"></span>
                    </label>
                </div>

                {isLoading && <p>Loading...</p>}

                {isPublic && !isLoading && (
                    <div className="link-container">
                        <p>Anyone with this link can view a read-only version of this board.</p>
                        <div className="url-input-group">
                            <input type="text" readOnly value={publicUrl} />
                            <button onClick={copyToClipboard} className="copy-button">
                                {copySuccess || 'Copy'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareModal;
