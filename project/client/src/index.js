import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserEvent from './event/UserEvent';
import Events from './event/Events';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import './index.css'
import News from './event/News';

export const Context = createContext(null);

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <Context.Provider value={{ 
    user: new UserEvent(), 
    events: new Events(),
    news: new News(),
    }}>
    <App />
    <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
  </Context.Provider>
);
