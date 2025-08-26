import { useEffect, useRef, useState } from 'react';
import { MantineProvider, AppShell, Container, Title, Text, Flex } from '@mantine/core';
import axios from 'axios';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import type { ChatMessage as ChatMessageType } from './types';
import { IconBrain } from '@tabler/icons-react';

const API_BASE_URL = 'http://localhost:3000/api';

export default function App() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const createSession = async () => {
            try {
                const response = await axios.post(`${API_BASE_URL}/chat/session`);
                setSessionId(response.data.sessionId);
            } catch (error) {
                console.error('Error creating session:', error);
            }
        };

        createSession();
    }, []);

    const handleSendMessage = async (content: string) => {
        if (!sessionId) return;

        const userMessage: ChatMessageType = { role: 'user', content };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/chat/${sessionId}`, {
                message: content
            });

            const assistantMessage: ChatMessageType = {
                role: 'assistant',
                content: response.data.response
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: ChatMessageType = {
                role: 'assistant',
                content: 'Sorry, there was an error processing your request. Please try again.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MantineProvider
            theme={{
                colorScheme: 'dark',
                primaryColor: 'blue',
                colors: {
                    dark: [
                        '#C1C2C5',
                        '#A6A7AB',
                        '#909296',
                        '#5C5F66',
                        '#373A40',
                        '#2C2E33',
                        '#25262B',
                        '#1A1B1E',
                        '#141517',
                        '#101113',
                    ],
                },
            }}
        >
            <div className="chat-container">
                <nav className="nav-bar">
                    <Container size="lg">
                        <Flex align="center" gap="md" style={{ height: '100%' }}>
                            <Title order={1} size="h3">Product Catalog Assistant</Title>
                        </Flex>
                    </Container>
                </nav>

                <main className="main-content">
                    <div className="messages-container">
                        {messages.length === 0 ? (
                            <div className="welcome-screen">
                                <IconBrain size={64} color="#10a37f" />
                                <Title order={2} className="welcome-title">
                                    How can I help you today?
                                </Title>
                                <Text size="lg" color="dimmed" className="welcome-text">
                                    Ask me anything about our products. I can help you find products,
                                    compare specifications, and make recommendations based on your needs.
                                </Text>
                            </div>
                        ) : (
                            <div className="messages-list">
                                {messages.map((message, index) => (
                                    <div 
                                        key={index} 
                                        className={`message-wrapper ${message.role}`}
                                    >
                                        <Container size="lg">
                                            <ChatMessage message={message} />
                                        </Container>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    <div className="input-container">
                        <Container size="lg">
                            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                        </Container>
                    </div>
                </main>
            </div>
        </MantineProvider>
    );
}