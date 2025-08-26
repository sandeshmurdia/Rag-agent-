import { Flex } from '@mantine/core';
import { IconUser, IconRobot } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isJson = message.content.startsWith('{') || message.content.startsWith('[');
    const containsTable = message.content.includes('|');

    const MessageIcon = message.role === 'assistant' ? IconRobot : IconUser;

    const renderContent = () => {
        if (isJson) {
            try {
                const formattedJson = JSON.stringify(JSON.parse(message.content), null, 2);
                return (
                    <SyntaxHighlighter 
                        language="json" 
                        style={vscDarkPlus}
                        customStyle={{
                            margin: '16px 0',
                            borderRadius: '6px',
                            background: '#1e1e1e',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {formattedJson}
                    </SyntaxHighlighter>
                );
            } catch {
                // If JSON parsing fails, fall back to regular text
            }
        }

        if (containsTable) {
            const lines = message.content.split('\n');
            const tableLines = lines.filter(line => line.includes('|'));
            const tableContent = tableLines.join('\n');
            const otherContent = lines.filter(line => !line.includes('|')).join('\n');

            return (
                <div className="message-content">
                    {otherContent && <ReactMarkdown>{otherContent}</ReactMarkdown>}
                    <div className="table-wrapper">
                        <table>
                            <tbody>
                                {tableLines.map((line, i) => (
                                    <tr key={i}>
                                        {line.split('|').map((cell, j) => {
                                            const trimmedCell = cell.trim();
                                            if (!trimmedCell) return null;
                                            return i === 0 || j === 0 ? (
                                                <th key={j}>{trimmedCell}</th>
                                            ) : (
                                                <td key={j}>{trimmedCell}</td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
            <div className="message-content">
                <ReactMarkdown components={{
                    code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                language={match[1]}
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: '16px 0',
                                    borderRadius: '6px',
                                    background: '#1e1e1e',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code {...props}>{children}</code>
                        );
                    }
                }}>
                    {message.content}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <Flex gap="md" align="flex-start" className="message">
            <div className={`message-icon ${message.role}`}>
                <MessageIcon size={24} />
            </div>
            <div className="message-body">
                {renderContent()}
            </div>
            <style jsx>{`
                .message {
                    max-width: 100%;
                }
                .message-icon {
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .message-icon.assistant {
                    background-color: #10a37f;
                    color: white;
                }
                .message-icon.user {
                    background-color: #5436DA;
                    color: white;
                }
                .message-body {
                    flex: 1;
                    min-width: 0;
                    font-size: 16px;
                    line-height: 1.6;
                }
                .message-content {
                    color: rgba(255,255,255,0.9);
                }
                .table-wrapper {
                    margin: 16px 0;
                    overflow-x: auto;
                }
            `}</style>
        </Flex>
    );
}