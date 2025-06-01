import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpaceForm } from './SpaceForm';
import { addSpaceObject } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Мокаем модули
jest.mock('../../lib/api');
jest.mock('react-hot-toast');

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

describe('SpaceForm', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  it('корректно отображает форму', () => {
    renderWithQueryClient(<SpaceForm />);

    // Проверяем, что форма скрыта изначально
    expect(screen.getByText('Добавить космический объект')).toBeInTheDocument();
    
    // Открываем форму
    fireEvent.click(screen.getByText('Добавить космический объект'));
    
    // Проверяем наличие полей формы
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('type-input')).toBeInTheDocument();
    expect(screen.getByTestId('mass-input')).toBeInTheDocument();
    expect(screen.getByTestId('diameter-input')).toBeInTheDocument();
    expect(screen.getByTestId('distance-input')).toBeInTheDocument();
    expect(screen.getByTestId('year-input')).toBeInTheDocument();
    expect(screen.getByTestId('habitable-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
  });

  it('отправляет данные при валидной форме', async () => {
    // Мокаем успешный ответ
    (addSpaceObject as jest.Mock).mockResolvedValue({ id: '100', name: 'Новая планета' });

    renderWithQueryClient(<SpaceForm />);

    // Открываем форму
    fireEvent.click(screen.getByText('Добавить космический объект'));

    // Заполняем форму
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Новая планета' },
    });
    fireEvent.change(screen.getByTestId('type-input'), {
      target: { value: 'Планета' },
    });
    fireEvent.change(screen.getByTestId('mass-input'), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByTestId('diameter-input'), {
      target: { value: '500' },
    });
    fireEvent.change(screen.getByTestId('distance-input'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByTestId('year-input'), {
      target: { value: '2023' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Тестовое описание планеты для проверки формы' },
    });

    // Отправляем форму
    fireEvent.click(screen.getByTestId('submit-button'));

    // Проверяем вызов API
    await waitFor(() => {
      expect(addSpaceObject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Новая планета',
          type: 'Планета',
          mass: 1000,
          diameter: 500,
          distance: 10,
          discoveryYear: 2023,
          description: 'Тестовое описание планеты для проверки формы',
        }),
      );
    });

    // Проверяем вызов уведомления
    expect(toast.success).toHaveBeenCalled();
  });

  it('показывает ошибки валидации при невалидной форме', async () => {
    renderWithQueryClient(<SpaceForm />);

    // Открываем форму
    fireEvent.click(screen.getByText('Добавить космический объект'));

    // Устанавливаем невалидные значения
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'ab' }, // Менее 3 символов
    });
    fireEvent.change(screen.getByTestId('mass-input'), {
      target: { value: '-100' }, // Отрицательная масса
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Мало' }, // Менее 10 символов
    });

    // Пытаемся отправить форму
    fireEvent.click(screen.getByTestId('submit-button'));

    // Проверяем ошибки
    await waitFor(() => {
      expect(screen.getByText('Минимум 3 символа')).toBeInTheDocument();
      expect(screen.getByText('Масса должна быть положительной')).toBeInTheDocument();
      expect(screen.getByText('Описание должно содержать минимум 10 символов')).toBeInTheDocument();
    });

    // Проверяем, что запрос не был отправлен
    expect(addSpaceObject).not.toHaveBeenCalled();
  });

  it('обрабатывает ошибку при отправке формы', async () => {
    // Мокаем ошибку
    (addSpaceObject as jest.Mock).mockRejectedValue(new Error('Ошибка сервера'));

    renderWithQueryClient(<SpaceForm />);

    // Открываем форму
    fireEvent.click(screen.getByText('Добавить космический объект'));

    // Заполняем форму валидными данными
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Новая планета' },
    });
    fireEvent.change(screen.getByTestId('type-input'), {
      target: { value: 'Планета' },
    });
    fireEvent.change(screen.getByTestId('mass-input'), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByTestId('diameter-input'), {
      target: { value: '500' },
    });
    fireEvent.change(screen.getByTestId('distance-input'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByTestId('year-input'), {
      target: { value: '2023' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Тестовое описание планеты для проверки формы' },
    });

    // Отправляем форму
    fireEvent.click(screen.getByTestId('submit-button'));

    // Проверяем вызов API
    await waitFor(() => {
      expect(addSpaceObject).toHaveBeenCalled();
    });

    // Проверяем вызов уведомления об ошибке
    expect(toast.error).toHaveBeenCalled();
  });
});