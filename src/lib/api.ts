import axios from 'axios';

export interface SpaceObject {
  id: string;
  name: string;
  type: string;
  mass: number;
  diameter: number;
  distance: number;
  isHabitable: boolean;
  discoveryYear: number;
  description: string;
}

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// Получение космических объектов
export const fetchSpaceObjects = async (page = 1, limit = 10) => {
  const response = await api.get('/space-objects', {
    params: {
      _page: page,
      _limit: limit,
      _sort: 'id',
      _order: 'desc',
    },
  });
  return response;
};

// Добавление космического объекта
export const addSpaceObject = async (spaceObject: Omit<SpaceObject, 'id'>) => {
  const response = await api.post('/space-objects', spaceObject);
  return response.data;
};

// Удаление космического объекта
export const deleteSpaceObject = async (id: string) => {
  const response = await api.delete(`/space-objects/${id}`);
  return response.data;
};

export default api;
