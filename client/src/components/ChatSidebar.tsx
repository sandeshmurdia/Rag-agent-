import { IconPlus, IconMessage, IconTrash, IconClock } from '@tabler/icons-react';
import { Text, Button, ScrollArea, Tooltip, Flex } from '@mantine/core';

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
        return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
    };

    const sortedSessions = [...sessions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return (
        <div className="chat-sidebar">
            <div className="sidebar-header">
                <Button 
                    leftIcon={<IconPlus size={16} />}
                    fullWidth
                    onClick={onNewChat}
                    className="new-chat-button"
                >
                    New Chat
                </Button>
            </div>
            <ScrollArea className="chat-list">
                {sortedSessions.map((session) => (
                    <div
                        key={session.id}
                        className={`chat-item ${session.id === currentSessionId ? 'active' : ''}`}
                        onClick={() => onSelectChat(session.id)}
                    >
                        <div className="chat-item-content">
                            <div className="chat-item-icon">
                                <IconMessage size={16} className="chat-icon" />
                            </div>
                            <div className="chat-details">
                                <Text size="sm" className="chat-title">
                                    {getChatTitle(session)}
                                </Text>
                                <Flex align="center" gap="xs" className="chat-meta">
                                    <IconClock size={12} />
                                    <Text size="xs" className="chat-date">
                                        {formatDate(session.createdAt)}
                                    </Text>
                                    <Text size="xs" className="message-count">
                                        {session.messages.length} messages
                                    </Text>
                                </Flex>
                            </div>
                            <Tooltip label="Delete chat">
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
                        </div>
                    </div>
                ))}
                {sortedSessions.length === 0 && (
                    <div className="no-chats">
                        <Text color="dimmed" align="center" size="sm" style={{ padding: '20px' }}>
                            No chats yet. Start a new conversation!
                        </Text>
                    </div>
                )}
            </ScrollArea>
            <style jsx>{`
                .chat-sidebar {
                    width: 260px;
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
                    padding: 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .new-chat-button {
                    background-color: #10a37f !important;
                    transition: all 0.2s ease;
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
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .chat-item:hover {
                    background-color: rgba(255,255,255,0.05);
                }

                .chat-item.active {
                    background-color: rgba(16, 163, 127, 0.15);
                }

                .chat-item-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .chat-item-icon {
                    padding: 8px;
                    background-color: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chat-icon {
                    color: rgba(255,255,255,0.7);
                    flex-shrink: 0;
                }

                .chat-details {
                    flex: 1;
                    min-width: 0;
                }

                .chat-title {
                    color: rgba(255,255,255,0.9);
                    font-size: 14px;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 4px;
                }

                .chat-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255,255,255,0.5);
                    font-size: 12px;
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
                    padding: 4px !important;
                    height: auto !important;
                    min-height: 0 !important;
                }

                .chat-item:hover .delete-button {
                    opacity: 1;
                }

                .delete-button:hover {
                    color: #ff4d4f !important;
                    background-color: rgba(255,77,79,0.1) !important;
                }

                .no-chats {
                    padding: 20px;
                    text-align: center;
                    color: rgba(255,255,255,0.5);
                }
            `}</style>
        </div>
    );
}