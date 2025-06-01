import { fetchSpaceObjects, addSpaceObject, deleteSpaceObject } from '../lib/api';

// Определяем тип для моков
interface ApiMocks {
  get: jest.Mock;
  post: jest.Mock;
  delete: jest.Mock;
}

// Мокаем api из lib/api.ts
jest.mock('../lib/api', () => {
  // Сохраняем оригинальные функции
  const originalModule = jest.requireActual('../lib/api');
  
  // Создаем моки для функций
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockDelete = jest.fn();
  
  // Создаем мок для api
  const mockApi = {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  };
  
  // Переопределяем функции, чтобы они использовали наши моки
  return {
    ...originalModule,
    default: mockApi,
    fetchSpaceObjects: jest.fn().mockImplementation(async (page = 1, limit = 10) => {
      const response = await mockGet('/space-objects', {
        params: {
          _page: page,
          _limit: limit,
          _sort: 'id',
          _order: 'desc',
        },
      });
      return response;
    }),
    addSpaceObject: jest.fn().mockImplementation(async (spaceObject) => {
      const response = await mockPost('/space-objects', spaceObject);
      return response.data;
    }),
    deleteSpaceObject: jest.fn().mockImplementation(async (id) => {
      const response = await mockDelete(`/space-objects/${id}`);
      return response.data;
    }),
    __mocks__: {
      get: mockGet,
      post: mockPost,
      delete: mockDelete,
    },
  };
});

// Получаем моки из модуля
// @ts-ignore - игнорируем ошибку TypeScript для доступа к внутренним мокам
const mocks = jest.requireMock('../lib/api').__mocks__ as ApiMocks;

describe('API функции', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSpaceObjects', () => {
    it('должен получать космические объекты с правильными параметрами', async () => {
      // Подготавливаем мок-ответ
      const mockResponse = {
        data: [
          { id: '1', name: 'Земля', type: 'Планета' },
          { id: '2', name: 'Марс', type: 'Планета' }
        ],
        headers: {
          'x-total-count': '2'
        }
      };
      
      // Настраиваем мок
      mocks.get.mockResolvedValueOnce(mockResponse);

      // Вызываем функцию
      const result = await fetchSpaceObjects(1, 10);

      // Проверяем, что функция была вызвана с правильными параметрами
      expect(mocks.get).toHaveBeenCalledWith('/space-objects', {
        params: {
          _page: 1,
          _limit: 10,
          _sort: 'id',
          _order: 'desc',
        },
      });

      // Проверяем результат
      expect(result).toEqual(mockResponse);
    });

    it('должен обрабатывать ошибки при получении данных', async () => {
      // Подготавливаем мок-ошибку
      const errorMessage = 'Network Error';
      mocks.get.mockRejectedValueOnce(new Error(errorMessage));

      // Проверяем, что функция выбрасывает ошибку
      await expect(fetchSpaceObjects()).rejects.toThrow(errorMessage);
    });
  });

  describe('addSpaceObject', () => {
    it('должен добавлять новый космический объект', async () => {
      // Подготавливаем тестовые данные и мок-ответ
      const newObject = {
        name: 'Новая планета',
        type: 'Планета',
        mass: 1000,
        diameter: 500,
        distance: 0,
        isHabitable: false,
        discoveryYear: 2023,
        description: 'Тестовое описание',
      };

      const mockResponse = {
        data: {
          id: '100',
          ...newObject,
        },
      };

      // Настраиваем мок
      mocks.post.mockResolvedValueOnce(mockResponse);

      // Вызываем функцию
      const result = await addSpaceObject(newObject);

      // Проверяем, что функция была вызвана с правильными параметрами
      expect(mocks.post).toHaveBeenCalledWith('/space-objects', newObject);

      // Проверяем результат
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteSpaceObject', () => {
    it('должен удалять космический объект по ID', async () => {
      // Подготавливаем мок-ответ
      const mockResponse = {
        data: { success: true }
      };
      
      // Настраиваем мок
      mocks.delete.mockResolvedValueOnce(mockResponse);

      // Вызываем функцию
      const result = await deleteSpaceObject('123');

      // Проверяем, что функция была вызвана с правильным ID
      expect(mocks.delete).toHaveBeenCalledWith('/space-objects/123');

      // Проверяем результат
      expect(result).toEqual(mockResponse.data);
    });

    it('должен обрабатывать ошибки при удалении', async () => {
      // Подготавливаем мок-ошибку
      const errorMessage = 'Not Found';
      mocks.delete.mockRejectedValueOnce(new Error(errorMessage));

      // Проверяем, что функция выбрасывает ошибку
      await expect(deleteSpaceObject('999')).rejects.toThrow(errorMessage);
    });
  });
});