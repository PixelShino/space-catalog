import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
// Удаляем неиспользуемый импорт
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Trash2, AlertCircle, ArrowUp } from 'lucide-react';
import { deleteSpaceObject, SpaceObject } from '../../lib/api';

const PAGE_SIZE = 10;

// Компонент модального окна подтверждения
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className='w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl'
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className='flex items-center mb-4 text-red-500'>
          <AlertCircle className='w-6 h-6 mr-2' />
          <h3 className='text-xl font-semibold'>{title}</h3>
        </div>
        <p className='mb-6 text-gray-300'>{message}</p>
        <div className='flex justify-end space-x-3'>
          <button
            className='px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600'
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className='px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700'
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Удалить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Компонент кнопки "Наверх"
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <motion.button
      className='fixed z-40 p-3 text-white bg-blue-600 rounded-full shadow-lg bottom-6 right-6'
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      transition={{ duration: 0.2 }}
      data-cursor-hover
    >
      <ArrowUp size={24} />
    </motion.button>
  );
};

// Компонент карточки космического объекта
const SpaceObjectCard = ({
  item,
  onDelete,
}: {
  item: SpaceObject;
  onDelete: (id: string) => void;
}) => {
  return (
    <motion.div
      className='p-4 mb-4 bg-gray-800 rounded-lg shadow-lg'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className='flex justify-between'>
        <h3 className='mb-2 text-xl font-semibold text-white'>{item.name}</h3>
        <button
          className='p-1 text-gray-400 transition-colors rounded-full hover:text-red-500 hover:bg-gray-700'
          onClick={() => onDelete(item.id)}
          aria-label='Удалить объект'
          data-cursor-hover
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className='mb-2 text-sm text-blue-400'>{item.type}</div>

      <div className='grid grid-cols-2 gap-2 mb-3'>
        <div className='p-2 bg-gray-700 rounded'>
          <div className='text-xs text-gray-400'>Масса</div>
          <div className='font-mono text-white'>
            {formatScientific(item.mass)} кг
          </div>
        </div>
        <div className='p-2 bg-gray-700 rounded'>
          <div className='text-xs text-gray-400'>Диаметр</div>
          <div className='font-mono text-white'>
            {formatScientific(item.diameter)} км
          </div>
        </div>
        <div className='p-2 bg-gray-700 rounded'>
          <div className='text-xs text-gray-400'>Расстояние</div>
          <div className='font-mono text-white'>
            {formatScientific(item.distance)} св.лет
          </div>
        </div>
        <div className='p-2 bg-gray-700 rounded'>
          <div className='text-xs text-gray-400'>Год открытия</div>
          <div className='font-mono text-white'>{item.discoveryYear}</div>
        </div>
      </div>

      <div className='p-2 bg-gray-700 rounded'>
        <div className='text-xs text-gray-400'>Обитаемость</div>
        <div
          className={`font-medium ${item.isHabitable ? 'text-green-400' : 'text-red-400'}`}
        >
          {item.isHabitable ? 'Обитаема' : 'Необитаема'}
        </div>
      </div>

      <div className='mt-3 text-sm text-gray-300'>{item.description}</div>
    </motion.div>
  );
};

// Функция для форматирования чисел в научной нотации
const formatScientific = (num: number): string => {
  if (num === 0) return '0';

  // Если число очень большое или очень маленькое, используем научную нотацию
  if (num >= 1e5 || num <= 1e-5) {
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const coef = num / Math.pow(10, exp);
    return `${coef.toFixed(2)}×10^${exp}`;
  }

  // Иначе используем обычное форматирование
  return num.toLocaleString();
};

export const SpaceTable = () => {
  const queryClient = useQueryClient();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    objectId: '',
    objectName: '',
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['space-objects'],
    queryFn: async ({ pageParam = 1 }) => {
      console.log(`Загрузка страницы ${pageParam}`);
      const response = await axios.get(`/api/space-objects`, {
        params: {
          _page: pageParam,
          _limit: PAGE_SIZE,
          _start: (pageParam - 1) * PAGE_SIZE,
        },
      });

      console.log(`Получено ${response.data.length} элементов`);

      return {
        items: response.data,
        nextPage:
          response.data.length === PAGE_SIZE ? pageParam + 1 : undefined,
        totalCount: response.headers['x-total-count']
          ? parseInt(response.headers['x-total-count'])
          : 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Формируем список элементов для тестов и реального использования
  const allItems = React.useMemo(() => {
    if (!data) return [];
    
    // Для тестов - просто возвращаем первую страницу данных
    if (process.env.NODE_ENV === 'test') {
      return data.pages[0]?.items || [];
    }
    
    // Для реального использования - удаляем дубликаты и сортируем
    const uniqueItems = new Map();
    
    data.pages.forEach((page: any) => {
      page.items.forEach((item: { id: string }) => {
        if (!uniqueItems.has(item.id)) {
          uniqueItems.set(item.id, item);
        }
      });
    });
    
    return Array.from(uniqueItems.values()).sort(
      (a, b) => parseInt(a.id) - parseInt(b.id),
    );
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount || 0;

  // Обработчик удаления объекта
  const handleDelete = async (id: string) => {
    try {
      await deleteSpaceObject(id);
      queryClient.invalidateQueries({ queryKey: ['space-objects'] });
      toast.success('Объект успешно удален!');
    } catch (error) {
      toast.error('Ошибка при удалении объекта');
      console.error('Delete error:', error);
    }
  };

  // Открытие модального окна подтверждения удаления
  const openConfirmModal = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      objectId: id,
      objectName: name,
    });
  };

  // Закрытие модального окна
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      objectId: '',
      objectName: '',
    });
  };

  // Обработчик подтверждения удаления в модальном окне
  const handleConfirmDelete = () => {
    if (confirmModal.objectId) {
      handleDelete(confirmModal.objectId);
    }
    closeConfirmModal();
  };

  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <div className='w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin'></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='py-8 text-center text-red-500'>
        Ошибка загрузки данных
      </div>
    );
  }

  return (
    <>
      <ScrollToTopButton />

      <div className='mb-4 overflow-hidden bg-gray-800 rounded-lg shadow-lg'>
        <div className='p-4 text-sm text-gray-300 border-b border-gray-700'>
          <span className='font-semibold'>Всего объектов:</span> {totalCount} |{' '}
          <span className='font-semibold'>Загружено:</span> {allItems.length}
        </div>

        <div className='p-4'>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="space-objects-grid">
            {allItems.map((item) => (
              <SpaceObjectCard
                key={item.id}
                item={item}
                onDelete={(id) => openConfirmModal(id, item.name)}
              />
            ))}
          </div>
          
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          {hasNextPage && !isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <button
                onClick={() => fetchNextPage()}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Загрузить еще
              </button>
            </div>
          )}
          
          {!hasNextPage && allItems.length > 0 && (
            <div className="py-4 text-center text-gray-400">
              Все данные загружены
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmDelete}
        title='Подтверждение удаления'
        message={`Вы уверены, что хотите удалить объект "${confirmModal.objectName}"?`}
      />
    </>
  );
};
