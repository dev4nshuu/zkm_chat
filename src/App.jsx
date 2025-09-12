import React, { useState, useEffect, useRef } from 'react';
import { db, firebaseConnection } from './firebase/config';
import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, addDoc, query, where, serverTimestamp } from 'firebase/firestore';

import AuthPage from './components/AuthPage';
import ChatInterface from './components/ChatInterface';
import Modal from './components/Modal';

function App() {
    const [page, setPage] = useState('login'); 
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [chatWith, setChatWith] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [modal, setModal] = useState({ show: false, content: null });
    const [isReady, setIsReady] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        try {
            const savedSession = sessionStorage.getItem('pgp-chat-session');
            if (savedSession) {
                const sessionUser = JSON.parse(savedSession);
                window.openpgp.readPrivateKey({ armoredKey: sessionUser.privateKeyArmored }).then(privateKey => {
                    // We also need the public key for sending messages
                    const userWithKeys = { 
                        username: sessionUser.username, 
                        privateKey, 
                        publicKeyArmored: sessionUser.publicKeyArmored 
                    };
                    setCurrentUser(userWithKeys);
                    setPage('chat');
                });
            }
        } catch (e) {
            console.error("Failed to parse session:", e);
            sessionStorage.removeItem('pgp-chat-session');
        }

        firebaseConnection.then(() => {
            if (window.openpgp) setIsReady(true);
            else {
                const interval = setInterval(() => { if (window.openpgp) { setIsReady(true); clearInterval(interval); }}, 100);
            }
        }).catch(err => showError(`Initialization failed: ${err.message}`));
    }, []);

    const showError = (msg) => {
        console.error(msg);
        setError(msg);
        setTimeout(() => setError(''), 5000);
    };

    const showModal = (title, content, actions) => setModal({ show: true, content: { title, content, actions } });
    const closeModal = () => setModal({ show: false, content: null });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleRegister = async (username, password) => {
        if (!username || !password) return showError("Username and password are required.");
        setIsLoading(true);
        try {
            const userDoc = await getDoc(doc(db, "users", username));
            if (userDoc.exists()) throw new Error("Username already exists.");

            const { privateKey, publicKey } = await window.openpgp.generateKey({
                type: 'rsa',
                rsaBits: 4096,
                userIDs: [{ name: username }],
                passphrase: password
            });

            await setDoc(doc(db, "users", username), { publicKeyArmored: publicKey, username });

            const blob = new Blob([privateKey], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            showModal(
                "Registration Successful!",
                <>
                    <p className="text-gray-300">Download your private key and keep it safe. You need it to log in.</p>
                    <a href={url} download={`${username}_private_key.asc`} className="mt-4 inline-block w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors">Download Private Key</a>
                </>,
                [{ label: "Go to Login", onClick: () => { closeModal(); setPage('login'); } }]
            );
        } catch (err) {
            showError(`Registration failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // CHANGED: Now fetches the user's public key on login for self-encryption
    const handleLogin = async (username, password, privateKeyFile) => {
        if (!username || !password || !privateKeyFile) return showError("All fields are required.");
        setIsLoading(true);
        try {
            const privateKeyArmored = await privateKeyFile.text();
            const privateKey = await window.openpgp.decryptKey({
                privateKey: await window.openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
                passphrase: password
            });
            
            // Get the user's public key from Firestore
            const userDoc = await getDoc(doc(db, "users", username));
            if (!userDoc.exists()) throw new Error("Could not find user data on server.");
            const publicKeyArmored = userDoc.data().publicKeyArmored;

            const userSession = { username, privateKey, publicKeyArmored };
            setCurrentUser(userSession);
            
            sessionStorage.setItem('pgp-chat-session', JSON.stringify({ username, privateKeyArmored, publicKeyArmored }));

            setPage('chat');
        } catch (err) {
            showError(`Login failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('pgp-chat-session');
        setCurrentUser(null);
        setPage('login');
    };

    useEffect(() => {
        if (!currentUser) { setUsers([]); return; };
        const q = query(collection(db, "users"), where("username", "!=", currentUser.username));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUsers(snapshot.docs.map(doc => doc.data()));
        }, (err) => showError(`Failed to listen for users: ${err.message}`));
        return () => unsubscribe();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || !chatWith) { setMessages([]); return; }
        const conversationId = [currentUser.username, chatWith].sort().join(':');
        const q = query(collection(db, "messages"), where("conversationId", "==", conversationId));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const promises = snapshot.docs.map(async (d) => {
                const data = d.data();
                try {
                    const message = await window.openpgp.readMessage({ armoredMessage: data.ciphertext });
                    const { data: decrypted } = await window.openpgp.decrypt({
                        message,
                        decryptionKeys: currentUser.privateKey
                    });
                    return { ...data, id: d.id, plaintext: decrypted };
                } catch (e) {
                    return { ...data, id: d.id, plaintext: "[Decryption Error]" };
                }
            });
            const decrypted = await Promise.all(promises);
            decrypted.sort((a, b) => a.timestamp?.toMillis() - b.timestamp?.toMillis());
            setMessages(decrypted);
        });
        return unsubscribe;
    }, [currentUser, chatWith]);

    // CHANGED: Now encrypts for BOTH the sender and the recipient
    const handleSendMessage = async (text) => {
        if (!text.trim() || !chatWith || !currentUser) return;
        try {
            const recipientDoc = await getDoc(doc(db, "users", chatWith));
            if (!recipientDoc.exists()) throw new Error("Recipient not found.");
            
            const recipientPublicKey = await window.openpgp.readKey({ armoredKey: recipientDoc.data().publicKeyArmored });
            const senderPublicKey = await window.openpgp.readKey({ armoredKey: currentUser.publicKeyArmored });
            
            const encryptedMessage = await window.openpgp.encrypt({
                message: await window.openpgp.createMessage({ text }),
                // Encrypt for both people
                encryptionKeys: [recipientPublicKey, senderPublicKey],
                signingKeys: currentUser.privateKey
            });

            const conversationId = [currentUser.username, chatWith].sort().join(':');
            
            await addDoc(collection(db, "messages"), {
                conversationId,
                from: currentUser.username,
                to: chatWith,
                ciphertext: encryptedMessage,
                timestamp: serverTimestamp()
            });
        } catch (err) {
            showError(`Failed to send message: ${err.message}`);
        }
    };

    const renderPage = () => {
        switch (page) {
            case 'chat':
                return <ChatInterface {...{ currentUser, users, chatWith, setChatWith, messages, onSendMessage: handleSendMessage, onLogout: handleLogout, messagesEndRef, isLoading }} />;
            case 'login':
                return <AuthPage title="Login" buttonText="Login" onSubmit={handleLogin} isLogin {...{ isLoading, setPage, isReady }} />;
            default:
                return <AuthPage title="Register" buttonText="Register" onSubmit={handleRegister} {...{ isLoading, setPage, isReady }} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col antialiased">
            {error && <div className="bg-red-500 text-white p-3 text-center fixed top-0 w-full z-50"><p>{error}</p></div>}
            {modal.show && <Modal onClose={closeModal}>
                <h2 className="text-2xl font-bold mb-4 text-indigo-400">{modal.content.title}</h2>
                <div>{modal.content.content}</div>
                {modal.content.actions && <div className="mt-6 flex justify-center space-x-4">
                    {modal.content.actions.map(action => (<button key={action.label} onClick={action.onClick} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">{action.label}</button>))}
                </div>}
            </Modal>}
            {renderPage()}
        </div>
    );
}

export default App;