# NeuroForm.AI - Intelligent Form Builder

A modern, AI-powered form builder application with natural language processing capabilities. Create, manage, and analyze forms with ease using an intuitive chat interface.

## Features

- **AI-Powered Form Creation**: Use natural language to create forms through a conversational interface
- **Dynamic Form Builder**: Add various field types (text, number, date, dropdown, radio buttons, etc.)
- **Form Management**: Create, update, and manage multiple forms
- **Data Collection**: Submit and store form responses
- **Data Visualization**: View and analyze submitted form data
- **Dark/Light Theme**: Toggle between dark and light modes for comfortable viewing
- **Persistent Storage**: All data is stored locally in your browser using IndexedDB

## Tech Stack

<<<<<<< HEAD
- **Frontend**: React 18 with Vite
- **Styling**: CSS3 with CSS Variables for theming
- **Storage**: IndexedDB (browser-based database)
- **NLP**: Compromise.js for natural language processing
- **Routing**: React Router DOM
=======
- **User**: "> "Create a form with name as text, age as number, and date of birth as date""
- **Response: ** "> " ![image](https://github.com/user-attachments/assets/676b199f-90ae-4376-a66b-26c045f90e96)

>>>>>>> d383c1c200cfe8db4182c65bdbf6880b5b155054

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Storage

This application uses **IndexedDB** for data storage, which means:
- ✅ All data is stored locally in your browser
- ✅ No backend server required
- ✅ Data persists between sessions
- ✅ Can store large amounts of data (GBs)
- ⚠️ Data is specific to each browser/device
- ⚠️ Clearing browser data will delete all forms and submissions

## Usage

1. **Create Forms**: Use the chat interface to describe your form in natural language
2. **Manage Forms**: View and fill out forms in the Form List section
3. **View Data**: Check submitted data in the Data List section

## Deployment

This is a static web application that can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any web server

No backend configuration is required as all data is stored in the browser.

## License

MIT
