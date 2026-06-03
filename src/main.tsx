import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './screens/Root';
import { AppProvider } from './contexts/AppContext';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);
