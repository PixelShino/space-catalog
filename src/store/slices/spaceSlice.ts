import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchSpaceObjects, addSpaceObject, deleteSpaceObject, SpaceObject } from '../../lib/api';
import { toast } from 'react-hot-toast';

interface SpaceState {
  objects: SpaceObject[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SpaceState = {
  objects: [],
  status: 'idle',
  error: null,
};

export const fetchSpaceObjectsAsync = createAsyncThunk(
  'space/fetchSpaceObjects',
  async () => {
    const response = await fetchSpaceObjects();
    return response.data;
  }
);

export const addSpaceObjectAsync = createAsyncThunk(
  'space/addSpaceObject',
  async (spaceObject: Omit<SpaceObject, 'id'>) => {
    const response = await addSpaceObject(spaceObject);
    toast.success('Объект успешно добавлен!');
    return response;
  }
);

export const deleteSpaceObjectAsync = createAsyncThunk(
  'space/deleteSpaceObject',
  async (id: string) => {
    await deleteSpaceObject(id);
    toast.success('Объект успешно удален!');
    return id;
  }
);

const spaceSlice = createSlice({
  name: 'space',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpaceObjectsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        fetchSpaceObjectsAsync.fulfilled,
        (state, action: PayloadAction<SpaceObject[]>) => {
          state.status = 'succeeded';
          state.objects = action.payload;
        }
      )
      .addCase(fetchSpaceObjectsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Произошла ошибка';
        toast.error('Ошибка при загрузке данных');
      })
      .addCase(
        addSpaceObjectAsync.fulfilled,
        (state, action: PayloadAction<SpaceObject>) => {
          state.objects.push(action.payload);
        }
      )
      .addCase(
        deleteSpaceObjectAsync.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.objects = state.objects.filter(obj => obj.id !== action.payload);
        }
      );
  },
});

export default spaceSlice.reducer;