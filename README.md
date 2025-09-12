# PGP Secure Chat

PGP Secure Chat is a web-based, real-time messaging application engineered with a primary focus on user privacy and data security. It provides strong, end-to-end encryption for all communications using a zero-knowledge model. This architecture ensures that the server infrastructure has no ability to read user messages or access the private keys required for decryption, placing control squarely in the hands of the user.

Built with React and Firebase, this application demonstrates a modern approach to building secure, serverless, real-time applications.

## Core Features

* **True End-to-End Encryption:** All messages are encrypted in the browser before transmission and decrypted upon receipt. The server only ever handles and stores unintelligible ciphertext.

* **Client-Side Key Generation:** Secure RSA-4096 key pairs are generated and managed entirely by the client's browser. The user's private key is immediately encrypted with their password and is never sent to the server in any form.

* **Message Authenticity & Integrity:** Messages are digitally signed using the sender's private key. This allows the recipient to verify that a message was sent by the authentic user and has not been tampered with in transit.

* **Real-time & Persistent:** The application uses WebSockets via Firestore for live messaging. It also remembers your login session if you refresh the page, providing a seamless and uninterrupted user experience.

## How the Security Works

The application's security is founded on the principles of the OpenPGP standard, ensuring a robust and verifiable cryptographic process.

1.  **Registration & Key Generation:** When a user registers, a new **RSA-4096** public/private key pair is generated locally in their browser.
    * The **Public Key** is sent to the Firestore server to be associated with the username. This allows other users to find it and use it to encrypt messages.
    * The **Private Key**, the user's most important secret, is immediately encrypted with a strong symmetric cipher (AES-256) using the user's password as the key. The user is then prompted to download this encrypted private key file. The server never has access to the password or the unencrypted private key.

2.  **Login & Key Decryption:** To log in, a user must provide three pieces of information: their username, their password, AND their unique private key file. The application uses the password to decrypt the private key locally, loading it into memory for the duration of the session.

3.  **Messaging - Encryption & Signing:** When a message is sent, a two-step process occurs:
    * **Signing (Authenticity):** The message is first digitally signed with the sender's unlocked private key.
    * **Encryption (Confidentiality):** The signed message is then encrypted using the public keys of **both the sender and the recipient**. Encrypting for both users is a critical step that ensures the sender can also decrypt and view their own message history. The final ciphertext is then sent to the server.

## Tech Stack

* **Frontend: React.js**
    * Chosen for its component-based architecture, which allows for a clean, scalable, and maintainable user interface.
* **Backend: Google Firebase (Firestore)**
    * Provides a real-time, NoSQL database that simplifies the complexities of live chat. It acts as a "serverless" backend, handling data storage and real-time listeners.
* **Cryptography: OpenPGP.js**
    * A well-audited JavaScript implementation of the OpenPGP standard, providing all necessary functions for key generation, encryption, decryption, and digital signatures.
* **Styling: Tailwind CSS**
    * A utility-first CSS framework that enables rapid development of a modern and responsive user interface.

## Quick Start & Local Setup

### 1. Prerequisites

* **Node.js and npm:** You must have these installed on your machine to manage packages and run the development server. You can get them from the [Node.js official website](https://nodejs.org/).
* **A Google Firebase project:** This is required for the backend database. You can create one for free.

### 2. Installation

1.  **Clone the repository:** Open your terminal and run the following command to download the project files.
    ```bash
    git clone [https://github.com/Cyber-Security-July-Dec-2025/C16.git](https://github.com/Cyber-Security-July-Dec-2025/C16.git)
    cd C16
    ```

2.  **Install dependencies:** This command reads the `package.json` file and installs all the necessary libraries (React, Firebase, etc.).
    ```bash
    npm install
    ```

### 3. Configuration

1.  **Set Up Firebase:**
    * In your Firebase project console, navigate to **Build > Firestore Database** and create a new database. It is crucial to start it in **test mode** for development.
    * Next, navigate to **Build > Authentication**, click "Get started", and simply enable the service. This is required for the app's backend connection.

2.  **Add Credentials:**
    * In your Firebase project's settings, find your **Web App** configuration.
    * Copy the entire `firebaseConfig` JavaScript object.
    * Paste this object into the `src/firebase/config.js` file in your project, replacing the placeholder values.

### 4. Run the App

Once configuration is complete, start the local development server.
```bash
npm start