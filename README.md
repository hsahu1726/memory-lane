# ⚓ MemoryLane: Dead Man's Chest

**Preserve memories, bridge time. Dead Man's Chest is a secure digital time capsule platform where users can lock away media for future loved ones, based on time or specific life events.**

## 🎥 Live Deployment Status

This table provides the URLs for the live, decoupled services.

| Component | Status | URL |
| :--- | :--- | :--- |
| **Frontend (Next.js)** | **Live** | https://memory-lane-lovat.vercel.app |
| **Backend API (Node/Express)** | **Live** | https://memory-lane-7yox.onrender.com |

---
## 🖼️ Demo & Media
A collection of images, screenshots, and a video demo of the working application model.

* **Project Assets:** [Google Drive Folder](https://drive.google.com/drive/folders/1ogMFnb4Bmv9NbZgm_tru8b06Vpye59mA?usp=sharing)

---

## ✨ Key Features

### Core Time Capsule Functionality
* **Secure Time Capsules:** Users can upload, encrypt, and organize digital media (photos, text, video) into personalized capsules.
* **Unlock Conditions:** Capsules can be set to unlock on a **specific future date** or when a **life event** (e.g., graduation) is manually verified by a family administrator.
* **Authenticated Access:** Personal user map displays only the capsules created by or shared with the logged-in user.
* **Inter-generational Connection:** Logic in the backend runs a scheduled job to ensure timely delivery of memories.

### Technology & Architecture
* **Decoupled Architecture:** Frontend and Backend are hosted on separate, specialized platforms for optimal performance and scalability.
* **AI Integration (Gemini):** Used for content enhancement, transcription, or summarization of long notes within the capsules.
* **Robust Authentication:** Secure user registration/login using JWT (JSON Web Tokens).

## 💻 Tech Stack

| Component | Technology | Hosted On |
| :--- | :--- | :--- |
| **Frontend (Client)** | **Next.js, React, TypeScript** | Vercel |
| **Backend (API)** | **Node.js, Express.js** | Render |
| **Database** | **MongoDB Atlas (Mongoose)** | MongoDB Atlas |
| **AI Services** | **Google Gemini API** | Integrated via `@google/genai` |
| **Styling** | **Tailwind CSS** | - |

## 🚀 Setup Instructions (Local Development)

Follow these steps to get the project running on your local machine for development and testing.

### Prerequisites

You must have the following installed:
* Node.js (v20.x or higher)
* npm (v10.x or higher)
* A MongoDB Atlas cluster and a corresponding connection string (`MONGO_URI`).
* A Google Gemini API Key.

### 1. Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/memory-lane.git](https://github.com/your-username/memory-lane.git)
    cd memory-lane
    ```

2.  **Install dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```

### 2. Configure Environment Variables

Create a file named **`.env`** in the root directory and add your credentials.

```env
# --- Backend / Database ---
PORT=5000
# Ensure this user/password has access to your MongoDB cluster (Network Access must be set)
MONGO_URI="mongodb+srv://<user>:<password>@<cluster_name>/memorylane" 
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
JWT_SECRET="YOUR_STRONG_SECRET_KEY"

# --- Frontend (Client) ---


For local development:
NEXT_PUBLIC_API_URL=http://localhost:5000

For production (Vercel):
NEXT_PUBLIC_API_URL=https://memory-lane-7yox.onrender.com
