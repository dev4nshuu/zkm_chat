import React, { useState } from 'react';

const ChatInterface = ({ currentUser, users, chatWith, setChatWith, messages, onSendMessage, onLogout, messagesEndRef, isLoading }) => {
    const [messageText, setMessageText] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        onSendMessage(messageText);
        setMessageText('');
    };

    return (
        <div className="flex h-screen">
            <aside className="w-1/3 lg:w-1/4 bg-gray-800 flex flex-col border-r border-gray-700">
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Secure Chat</h2>
                    <button onClick={onLogout} className="text-sm text-gray-400 hover:text-white">Logout</button>
                </header>
                <div className="p-2 text-sm text-gray-400">Logged in as: <strong className="text-indigo-400">{currentUser.username}</strong></div>
                <div className="flex-grow overflow-y-auto">
                    <h3 className="p-4 text-sm font-semibold text-gray-500">USERS</h3>
                    <ul>
                        {users.map(user => (
                            <li key={user.username}>
                                <button
                                    onClick={() => setChatWith(user.username)}
                                    className={`w-full text-left p-4 hover:bg-gray-700 transition-colors ${chatWith === user.username ? 'bg-indigo-900' : ''}`}
                                >
                                    {user.username}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            <main className="w-2/3 lg:w-3/4 flex flex-col">
                {chatWith ? (
                    <>
                        <header className="p-4 border-b border-gray-700 bg-gray-800">
                            <h2 className="text-xl font-semibold">Chat with <span className="text-indigo-400">{chatWith}</span></h2>
                        </header>
                        <div className="flex-grow p-4 overflow-y-auto bg-gray-900">
                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.from === currentUser.username ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xl p-3 rounded-xl ${msg.from === currentUser.username ? 'bg-indigo-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                                            <p className="text-white break-words">{msg.plaintext}</p>
                                            <p className="text-xs text-gray-400 mt-1 text-right">{msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : ''}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                        <footer className="p-4 bg-gray-800">
                            <form onSubmit={handleSend} className="flex space-x-4">
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    className="flex-grow px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Type your encrypted message..."
                                />
                                <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600">
                                    Send
                                </button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-500">
                        <p>Select a user to start chatting.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatInterface;