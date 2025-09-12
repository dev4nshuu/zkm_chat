import React, { useState } from 'react';
import Spinner from './Spinner';

const AuthPage = ({ title, buttonText, onSubmit, isLogin = false, isLoading, setPage, isReady }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [privateKeyFile, setPrivateKeyFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            onSubmit(username, password, privateKeyFile);
        } else {
            onSubmit(username, password);
        }
    };

    const getButtonText = () => {
        if (isLoading) return <Spinner />;
        if (!isReady) return 'Initializing...';
        return buttonText;
    }

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                <h1 className="text-3xl font-bold text-center mb-2 text-indigo-400">{title}</h1>
                <p className="text-center text-gray-400 mb-8">End-to-end encrypted messaging with PGP.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Choose a unique username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Used to encrypt your private key"
                        />
                    </div>
                    {isLogin && (
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Private Key File</label>
                            <input
                                type="file"
                                onChange={(e) => setPrivateKeyFile(e.target.files[0])}
                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                                accept=".asc"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading || !isReady}
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center h-12"
                    >
                        {getButtonText()}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <button onClick={() => setPage(isLogin ? 'register' : 'login')} className="text-indigo-400 hover:underline">
                        {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;