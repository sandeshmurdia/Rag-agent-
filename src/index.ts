import express from 'express';
import cors from 'cors';
import { config } from './config';
import { agent } from './services/agent';
import { memory } from './services/memory';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from './types';

const app = express();

app.use(cors());
app.use(express.json());

// Start new chat session
app.post('/api/chat/session', (req, res) => {
    const sessionId = uuidv4();
    memory.createSession(sessionId);
    res.json({ sessionId });
});

// Process chat message
app.post('/api/chat/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const session = memory.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Add user message to memory
        const userMessage: ChatMessage = { role: 'user', content: message };
        memory.addMessage(sessionId, userMessage);

        // Process query
        const chatHistory = memory.getMessages(sessionId);
        const response = await agent.processQuery(message, chatHistory);

        // Add assistant response to memory
        const assistantMessage: ChatMessage = { 
            role: 'assistant', 
            content: typeof response.response === 'string' ? response.response : JSON.stringify(response.response) 
        };
        memory.addMessage(sessionId, assistantMessage);

        res.json(response);
    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get chat history
app.get('/api/chat/:sessionId/history', (req, res) => {
    const { sessionId } = req.params;
    const session = memory.getSession(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session.messages);
});

// Start server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});