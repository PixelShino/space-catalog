import './index.css';
import { SpaceScene } from './components/SpaceScene/SpaceScene';
import { motion } from 'framer-motion';
import { CustomCursor } from './components/cursor/CustomCursor';
import { SpaceForm } from './components/Form/SpaceForm';
import { SpaceTable } from './components/Table/SpaceTable';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Создаем клиент для React Query с настройками кеширования
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
      retry: 1,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <motion.div
          className='h-screen w-screen overflow-auto text-white bg-gradient-to-b from-gray-900 to-black'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CustomCursor />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <header className='mb-10 text-center pt-8'>
            <motion.h1 
              className='mb-2 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600'
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Космический каталог
            </motion.h1>
            <motion.p 
              className='text-gray-400'
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Исследуйте объекты вселенной
            </motion.p>
          </header>

          <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            {/* 3D сцена */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-12 rounded-xl overflow-hidden shadow-2xl"
            >
              <SpaceScene />
            </motion.div>

            <motion.section 
              className='mb-12'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <SpaceForm />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className='mb-4 text-2xl font-semibold'>Космические объекты</h2>
              <SpaceTable />
            </motion.section>
          </main>

          <footer className='mt-16 text-center text-gray-500 pb-8'>
            <p>© {new Date().getFullYear()} Космический каталог</p>
          </footer>
        </motion.div>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;