import React from 'react';

const ShareButton = ({ onClick }) => {
    const buttonStyle = {
        padding: '8px 16px',
        backgroundColor: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '600',
        margin: '0 10px',
    };

    return (
        <button onClick={onClick} style={buttonStyle}>
            Share
        </button>
    );
};

export default ShareButton;
