import { IconPlus, IconMessage, IconTrash, IconClock } from '@tabler/icons-react';
import { Text, Button, ScrollArea, Tooltip, Flex, Box } from '@mantine/core';

interface ChatSession {
    id: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    createdAt: Date;
    title?: string;
}

interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string;
    onNewChat: () => void;
    onSelectChat: (sessionId: string) => void;
    onDeleteChat: (sessionId: string) => void;
}

export function ChatSidebar({ sessions, currentSessionId, onNewChat, onSelectChat, onDeleteChat }: ChatSidebarProps) {
    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (days > 0) {
            return `${days}d ago`;
        } else if (hours > 0) {
            return `${hours}h ago`;
        } else if (minutes > 0) {
            return `${minutes}m ago`;
        } else {
            return 'Just now';
        }
    };

    const getChatTitle = (session: ChatSession) => {
        if (session.title) return session.title;
        if (session.messages.length === 0) return 'New Chat';
        const firstUserMessage = session.messages.find(m => m.role === 'user');
        if (!firstUserMessage) return 'New Chat';
        return firstUserMessage.content.slice(0, 40) + (firstUserMessage.content.length > 40 ? '...' : '');
    };

    const sortedSessions = [...sessions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return (
        <Box className="chat-sidebar">
            <Box className="sidebar-header">
                <Button 
                    leftIcon={<IconPlus size={10} />}
                    fullWidth
                    onClick={onNewChat}
                    className="new-chat-button"
                    size="md"
                    style={{ border: 'none' }}
                >
                    New Chat
                </Button>
            </Box>
            <ScrollArea className="chat-list" scrollbarSize={6}>
                {sortedSessions.map((session) => (
                    <Box
                        key={session.id}
                        className={`chat-item ${session.id === currentSessionId ? 'active' : ''}`}
                        onClick={() => onSelectChat(session.id)}
                    >
                        <Flex className="chat-item-content" align="flex-start" style={{display: 'flex', gap: '10px'}}>
                            <div style={{width: '100%'}}>
                            <Box className="chat-item-icon">
                                <IconMessage size={18} className="chat-icon" />
                            </Box>
                            <Box className="chat-details">
                                <Text size="sm" className="chat-title" lineClamp={2}>
                                    {getChatTitle(session)}
                                </Text>
                                <Flex align="center" gap="xs" className="chat-meta">
                                    <IconClock size={14} />
                                    <Text size="xs" className="message-count">
                                        {session.messages.length} messages
                                    </Text>
                                </Flex>
                            </Box>
                            </div>
                            <Tooltip label="Delete chat" position="right">
                                <Button
                                    variant="subtle"
                                    size="xs"
                                    className="delete-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(session.id);
                                    }}
                                >
                                    <IconTrash size={16} />
                                </Button>
                            </Tooltip>
                        </Flex>
                    </Box>
                ))}
                {sortedSessions.length === 0 && (
                    <Box className="no-chats">
                        <Text color="dimmed" align="center" size="sm">
                            No chats yet. Start a new conversation!
                        </Text>
                    </Box>
                )}
            </ScrollArea>
            <style jsx>{`
                .chat-sidebar {
                    width: 320px;
                    height: 100vh;
                    background-color: #1a1b1e;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    z-index: 1000;
                }

                .sidebar-header {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    background-color: rgba(26,27,30,0.95);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }

                .new-chat-button {
                    background-color: #10a37f !important;
                    transition: all 0.2s ease;
                    height: 44px !important;
                    font-size: 15px !important;
                }

                .new-chat-button:hover {
                    background-color: #0e906f !important;
                    transform: translateY(-1px);
                }

                .chat-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .chat-item {
                    padding: 14px 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    position: relative;
                }

                .chat-item:hover {
                    background-color: rgba(255,255,255,0.05);
                }

                .chat-item.active {
                    background-color: rgba(16, 163, 127, 0.15);
                }

                .chat-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background-color: #10a37f;
                }

                .chat-item-content {
                    gap: 14px;
                    min-height: 50px;
                }

                .chat-item-icon {
                    padding: 8px;
                    background-color: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .chat-icon {
                    color: rgba(255,255,255,0.7);
                }

                .chat-details {
                    flex: 1;
                    min-width: 0;
                    padding-right: 8px;
                }

                .chat-title {
                    color: rgba(255,255,255,0.9);
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 1.4;
                    margin-bottom: 6px;
                    word-wrap: break-word;
                }

                .chat-meta {
                    color: rgba(255,255,255,0.5);
                    font-size: 12px;
                    gap: 8px;
                }

                .chat-date {
                    color: inherit;
                }

                .message-count {
                    color: inherit;
                    padding-left: 8px;
                    border-left: 1px solid rgba(255,255,255,0.2);
                }

                .delete-button {
                    opacity: 0;
                    transition: all 0.2s ease;
                    color: rgba(255,255,255,0.5) !important;
                    padding: 6px !important;
                    height: auto !important;
                    min-height: 0 !important;
                    background: transparent !important;
                }

                .chat-item:hover .delete-button {
                    opacity: 1;
                }

                .delete-button:hover {
                    color: #ff4d4f !important;
                    background-color: rgba(255,77,79,0.1) !important;
                    transform: scale(1.1);
                }

                .no-chats {
                    padding: 30px 20px;
                    text-align: center;
                    color: rgba(255,255,255,0.5);
                }
            `}</style>
        </Box>
    );
}