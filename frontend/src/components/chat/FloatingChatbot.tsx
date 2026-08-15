import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, Trash2, MessageCircle, X, Minimize2 } from 'lucide-react';
import { useHealthCoachChat } from '@/hooks/useHealthCoachChat';

export const FloatingChatbot = () => {
    const { messages, isLoading, sendMessage, clearMessages } = useHealthCoachChat();
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            sendMessage(input);
            setInput('');
        }
    };

    const quickActions = [
        "How can I improve my hydration?",
        "Suggest a healthy breakfast",
        "What exercises for beginners?",
        "How to reduce heart risk?"
    ];

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-50"
                >
                    <Bot className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-white animate-pulse" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="relative h-full flex flex-col rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
                        {/* Chat Header */}
                        <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Bot className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-white animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-white">AI Health Coach</h3>
                                    <Sparkles className="h-4 w-4 text-white/80 animate-pulse" />
                                </div>
                                <p className="text-xs text-white/80 flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    Ask your health questions
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {messages.length > 0 && (
                                    <button
                                        onClick={clearMessages}
                                        className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                                    >
                                        <Trash2 className="h-4 w-4 text-white" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                                >
                                    <X className="h-4 w-4 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mb-4">
                                            <Bot className="h-8 w-8 text-primary-600" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Welcome!</h4>
                                        <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
                                            I am your personal health coach. Ask me questions about nutrition, exercise, or your well-being.
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {quickActions.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => sendMessage(action)}
                                                    disabled={isLoading}
                                                    className="rounded-full bg-white px-4 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors border border-primary-200 disabled:opacity-50 shadow-sm"
                                                >
                                                    {action}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((message, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            {message.role === 'assistant' && (
                                                <div className="flex-shrink-0">
                                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <Bot className="h-4 w-4 text-primary-600" />
                                                    </div>
                                                </div>
                                            )}
                                            <div
                                                className={`flex-1 max-w-[80%] rounded-2xl p-4 ${message.role === 'user'
                                                    ? 'bg-primary-500 text-white rounded-tr-md ml-auto'
                                                    : 'bg-white border border-gray-200 rounded-tl-md'
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-primary-600" />
                                            </div>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask your question..."
                                    disabled={isLoading}
                                    className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="rounded-xl px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
