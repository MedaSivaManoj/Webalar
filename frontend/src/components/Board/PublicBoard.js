import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Column from './Column'; // Reusing the Column component

const PublicBoard = () => {
    const { publicId } = useParams();
    const [boardData, setBoardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicBoard = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API}/api/board/public/${publicId}`);
                setBoardData(res.data);
            } catch (err) {
                setError('Board not found or sharing is disabled.');
            }
            setLoading(false);
        };

        fetchPublicBoard();
    }, [publicId]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 50, fontSize: 24 }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: 50, fontSize: 24, color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: 40 }}>{boardData.user.username}'s Board</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <Column title="Todo" tasks={boardData.tasks.filter(t => t.status === 'Todo')} readOnly={true} />
                <Column title="In Progress" tasks={boardData.tasks.filter(t => t.status === 'In Progress')} readOnly={true} />
                <Column title="Done" tasks={boardData.tasks.filter(t => t.status === 'Done')} readOnly={true} />
            </div>
        </div>
    );
};

export default PublicBoard;
