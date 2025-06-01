import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpaceTable } from '../components/Table/SpaceTable';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { deleteSpaceObject } from '../lib/api';
import { toast } from 'react-hot-toast';

// Мокаем модули
jest.mock('axios');
jest.mock('../lib/api');
jest.mock('react-hot-toast');

// Создаем тестовые данные
const mockSpaceObjects = [
  {
    id: '1',
    name: 'Земля',
    type: 'Планета',
    mass: 5.972e24,
    diameter: 12742,
    distance: 0,
    isHabitable: true,
    discoveryYear: 0,
    description: 'Наша родная планета'
  },
  {
    id: '2',
    name: 'Марс',
    type: 'Планета',
    mass: 6.39e23,
    diameter: 6779,
    distance: 1.5,
    isHabitable: false,
    discoveryYear: 1659,
    description: 'Красная планета'
  }
];

// Настраиваем QueryClient для тестов
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Компонент-обертка для тестов
const renderWithQueryClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('SpaceTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Мокаем успешный ответ от API
    (axios.get as jest.Mock).mockResolvedValue({
      data: mockSpaceObjects,
      headers: {
        'x-total-count': '2'
      }
    });
  });

  it('отображает список космических объектов', async () => {
    renderWithQueryClient(<SpaceTable />);
    
    // Проверяем, что данные загружаются и отображаются
    await waitFor(() => {
      expect(screen.getByText('Земля')).toBeInTheDocument();
      expect(screen.getByText('Марс')).toBeInTheDocument();
    });
  });

  it('показывает модальное окно при попытке удаления объекта', async () => {
    // Мокаем функцию удаления
    (deleteSpaceObject as jest.Mock).mockResolvedValue({ success: true });
    
    renderWithQueryClient(<SpaceTable />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Земля')).toBeInTheDocument();
    });
    
    // Находим кнопки удаления и кликаем по первой
    const deleteButtons = screen.getAllByLabelText('Удалить объект');
    fireEvent.click(deleteButtons[0]);
    
    // Проверяем, что модальное окно появилось
    await waitFor(() => {
      expect(screen.getByText('Подтверждение удаления')).toBeInTheDocument();
    });
  });

  it('удаляет объект после подтверждения', async () => {
    // Мокаем функцию удаления
    (deleteSpaceObject as jest.Mock).mockResolvedValue({ success: true });
    
    renderWithQueryClient(<SpaceTable />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Земля')).toBeInTheDocument();
    });
    
    // Находим кнопку удаления и кликаем по ней
    const deleteButtons = screen.getAllByLabelText('Удалить объект');
    fireEvent.click(deleteButtons[0]);
    
    // Ждем появления модального окна
    await waitFor(() => {
      expect(screen.getByText('Подтверждение удаления')).toBeInTheDocument();
    });
    
    // Находим кнопку подтверждения в модальном окне и кликаем по ней
    // Используем getAllByText, так как может быть несколько кнопок с текстом "Удалить"
    const confirmButtons = screen.getAllByText('Удалить');
    fireEvent.click(confirmButtons[0]);
    
    // Проверяем, что функция удаления была вызвана
    await waitFor(() => {
      expect(deleteSpaceObject).toHaveBeenCalled();
    });
    
    // Проверяем, что было показано уведомление об успешном удалении
    expect(toast.success).toHaveBeenCalled();
  });

  it('отображает ошибку при неудачном удалении', async () => {
    // Мокаем ошибку при удалении
    (deleteSpaceObject as jest.Mock).mockRejectedValue(new Error('Ошибка удаления'));
    
    renderWithQueryClient(<SpaceTable />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Земля')).toBeInTheDocument();
    });
    
    // Находим кнопку удаления и кликаем по ней
    const deleteButtons = screen.getAllByLabelText('Удалить объект');
    fireEvent.click(deleteButtons[0]);
    
    // Ждем появления модального окна
    await waitFor(() => {
      expect(screen.getByText('Подтверждение удаления')).toBeInTheDocument();
    });
    
    // Находим кнопку подтверждения в модальном окне и кликаем по ней
    const confirmButtons = screen.getAllByText('Удалить');
    fireEvent.click(confirmButtons[0]);
    
    // Проверяем, что было показано уведомление об ошибке
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});