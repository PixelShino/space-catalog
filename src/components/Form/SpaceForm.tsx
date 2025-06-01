import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { addSpaceObject } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';

// Схема валидации формы
const spaceObjectSchema = z.object({
  name: z.string().min(3, 'Минимум 3 символа'),
  type: z.string().min(2, 'Тип должен содержать минимум 2 символа'),
  mass: z.coerce.number().positive('Масса должна быть положительной'),
  diameter: z.coerce.number().positive('Диаметр должен быть положительным'),
  distance: z.coerce.number().min(0, 'Расстояние не может быть отрицательным'),
  isHabitable: z.boolean(),
  discoveryYear: z.coerce
    .number()
    .int()
    .min(1500, 'Некорректный год открытия')
    .max(new Date().getFullYear(), 'Год не может быть в будущем'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов'),
});

type SpaceObjectForm = z.infer<typeof spaceObjectSchema>;

export const SpaceForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpaceObjectForm>({
    resolver: zodResolver(spaceObjectSchema),
    defaultValues: {
      name: '',
      type: '',
      mass: 0,
      diameter: 0,
      distance: 0,
      isHabitable: false,
      discoveryYear: new Date().getFullYear(),
      description: '',
    },
  });

  const onSubmit = async (data: SpaceObjectForm) => {
    try {
      await addSpaceObject(data);

      // Инвалидируем кеш запроса, чтобы обновить данные
      queryClient.invalidateQueries({ queryKey: ['space-objects'] });

      toast.success('Космический объект успешно добавлен!');
      reset();
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Ошибка при добавлении объекта');
      console.error('Submit error:', error);
    }
  };

  return (
    <div className='mb-8' data-testid='space-form'>
      <motion.button
        className='px-6 py-3 mb-4 text-white transition-all bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl'
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsFormOpen(!isFormOpen)}
        data-cursor-hover
      >
        {isFormOpen ? 'Скрыть форму' : 'Добавить космический объект'}
      </motion.button>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className='overflow-hidden'
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='p-6 bg-gray-800 rounded-lg shadow-lg'
            >
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-300'>
                    Название
                  </label>
                  <input
                    {...register('name')}
                    className='w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Например: Альфа Центавра'
                    data-cursor-hover
                    data-testid='name-input'
                  />
                  {errors.name && (
                    <p
                      className='mt-1 text-sm text-red-400'
                      data-testid='name-error'
                    >
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-300'>
                    Тип
                  </label>
                  <input
                    {...register('type')}
                    className='w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Например: Звезда, Планета, Астероид'
                    data-cursor-hover
                    data-testid='type-input'
                  />
                  {errors.type && (
                    <p
                      className='mt-1 text-sm text-red-400'
                      data-testid='type-error'
                    >
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-300'>
                    Масса (кг)
                  </label>
                  <input
                    {...register('mass')}
                    type='number'
                    step='any'
                    className='w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Например: 1.989e30'
                    data-cursor-hover
                    data-testid='mass-input'
                  />
                  {errors.mass && (
                    <p
                      className='mt-1 text-sm text-red-400'
                      data-testid='mass-error'
                    >
                      {errors.mass.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-300'>
                    Диаметр (км)
                  </label>
                  <input
                    {...register('diameter')}
                    type='number'
                    step='any'
                    className='w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Например: 1392700'
                    data-cursor-hover
                    data-testid='diameter-input'
                  />
                  {errors.diameter && (
                    <p
                      className='mt-1 text-sm text-red-400'
                      data-testid='diameter-error'
                    >
                      {errors.diameter.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-300'>
                    Расстояние (св. лет)
                  </label>
                  <input
                    {...register('distance')}
                    type='number'
                    step='any'
                    className='w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Например: 4.37'
                    data-cursor-hover
                    data-testid='distance-input'
                  />
                  {errors.distance && (
                    <p
                      className='mt-1 text-sm text-red-400'
                      data-testid='distance-error'
                    >
                      {errors.distance.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-300'>
                    Год открытия
                  </label>
                  <input
                    {...register('discoveryYear')}
                    type='number'
                    className='w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Например: 1915'
                    data-cursor-hover
                    data-testid='year-input'
                  />
                  {errors.discoveryYear && (
                    <p
                      className='mt-1 text-sm text-red-400'
                      data-testid='year-error'
                    >
                      {errors.discoveryYear.message}
                    </p>
                  )}
                </div>

                <div className='flex items-center'>
                  <input
                    {...register('isHabitable')}
                    type='checkbox'
                    id='isHabitable'
                    className='w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500'
                    data-cursor-hover
                    data-testid='habitable-input'
                  />
                  <label
                    htmlFor='isHabitable'
                    className='ml-2 text-sm font-medium text-gray-300'
                  >
                    Обитаемый объект
                  </label>
                </div>

                <div className='md:col-span-2'>
                  <label className='block mb-2 text-sm font-medium text-gray-300'>
                    Описание
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className='w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Опишите космический объект...'
                    data-cursor-hover
                    data-testid='description-input'
                  ></textarea>
                  {errors.description && (
                    <p
                      className='mt-1 text-sm text-red-400'
                      data-testid='description-error'
                    >
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex justify-end mt-6 space-x-3'>
                <motion.button
                  type='button'
                  className='px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    reset();
                    setIsFormOpen(false);
                  }}
                  data-cursor-hover
                  data-testid='cancel-button'
                >
                  Отмена
                </motion.button>
                <motion.button
                  type='submit'
                  className='px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmitting}
                  data-cursor-hover
                  data-testid='submit-button'
                >
                  {isSubmitting ? (
                    <span className='flex items-center'>
                      <svg
                        className='w-4 h-4 mr-2 animate-spin'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      Отправка...
                    </span>
                  ) : (
                    'Добавить объект'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
