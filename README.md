PGP Secure Chat
PGP Secure Chat is a web-based, real-time messaging application that provides strong, end-to-end encryption for all communications. It leverages the power of OpenPGP.js to implement a zero-knowledge cryptographic model, ensuring that only the communicating users can read their messages.

This project is built with a modern tech stack including React.js for the frontend, Google Firestore for the real-time backend, and Tailwind CSS for styling.

Core Features
True End-to-End Encryption: All messages are encrypted and decrypted entirely client-side (in the browser). The server only ever stores unintelligible ciphertext.

Zero-Knowledge Architecture: The server has no access to user passwords or private keys, making it impossible for the service provider to decipher user communications.

Secure, Client-Side Key Management: Strong RSA-4096 key pairs are generated and managed directly by the user's browser.

Message Authenticity & Integrity: Messages are digitally signed to prove they came from the correct sender and were not tampered with in transit.

Real-time Messaging: Messages appear instantly without needing to refresh the page.

Session Persistence: Your secure session is remembered if you refresh the page, providing a seamless user experience.

Deep Dive: The Cryptography Model
The security of this application is built on established cryptographic principles, implemented through OpenPGP.js. Here is a detailed breakdown of the processes.

1. Key Generation (Client-Side)
When a user registers, a new RSA-4096 key pair is generated directly within their browser. This process is entirely client-side.

Public Key: This key is designed to be shared. It is sent to the Firestore server and associated with the username. Other users will fetch this key to encrypt messages intended for this user.

Private Key: This key is the user's most critical secret. It never leaves the user's browser in an unencrypted state.

2. Private Key Protection
Immediately upon generation, the private key is encrypted using the user's chosen password. OpenPGP.js uses a strong symmetric encryption algorithm (like AES-256) for this. The password becomes the "key to the key."

The user is then prompted to download this encrypted private key as an .asc file.

This is the core of the zero-knowledge model. Without the user's password, the downloaded private key file is useless. Since the password is never sent to the server, the server has no way to access the user's private key.

3. Message Encryption & Signing (The Sending Process)
When a user sends a message, a multi-step cryptographic process occurs in the browser:

Fetch Public Keys: The application retrieves the public keys of both the recipient and the sender from Firestore.

Digital Signature (Authenticity): The plaintext message is digitally signed using the sender's own private key (which was unlocked with their password upon login). This signature acts as a verifiable seal, proving that the message originated from the sender and that its contents have not been altered.

Encryption (Confidentiality): The signed message is then encrypted using the public keys of both the sender and the recipient. Encrypting for both users is crucial, as it ensures that the sender can also decrypt and view their own sent messages in their chat history.

Transmit Ciphertext: Only the final, encrypted and signed block of ciphertext is sent to the Firestore server for storage.

4. Message Decryption & Verification (The Receiving Process)
When a client receives an encrypted message from the server:

Decryption: The application uses the logged-in user's private key to decrypt the message. If the user is not the intended sender or recipient, this step will fail mathematically, and the message will remain unreadable.

Signature Verification: After decryption, the application uses the sender's public key to verify the digital signature attached to the message. This confirms two things:

Authenticity: The message was indeed signed by the private key corresponding to the sender's public key.

Integrity: The message was not modified in any way after it was signed.

If both steps succeed, the plaintext is displayed to the user. This robust process guarantees both the confidentiality and authenticity of every message in the system.

Tech Stack
Frontend: React.js

Backend: Google Firebase (Firestore) for real-time database.

Styling: Tailwind CSS

Cryptography: OpenPGP.js (RSA-4096 for asymmetric encryption, AES-256 for symmetric key protection).

Setup and Installation
Follow these steps to get a local copy of the project up and running.

Prerequisites
Node.js and npm installed on your machine.

A Google Firebase account.

Step-by-Step Guide
Clone the Repository:

git clone <repository-url>
cd pgp-secure-chat

Install Dependencies:

npm install

Set Up Firebase:

Go to the Firebase Console and create a new project.

Add a new Web App (</>) to your project.

Copy the firebaseConfig object provided.

In the Firebase console, go to Build > Firestore Database and click "Create database". Start it in test mode.

Go to Build > Authentication, click "Get started", and enable the service.

Configure the Application:

In the project, navigate to src/firebase/config.js.

Replace the placeholder firebaseConfig object with the one you copied from your Firebase project.

Run the Development Server:

npm start
