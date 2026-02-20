import { createSlice } from '@reduxjs/toolkit';

export const fullscreenSlice = createSlice({
  initialState: {
    isFullscreen: false,
  },
  name: 'fullscreen',
  reducers: create => ({
    setFullscreen: create.reducer<{ isFullscreen: boolean }>((state, action) => {
      state.isFullscreen = action.payload.isFullscreen;
    }),
  }),
  selectors: {
    selectIsFullscreen: state => state.isFullscreen,
  },
});

export const { setFullscreen } = fullscreenSlice.actions;
export const { selectIsFullscreen } = fullscreenSlice.selectors;
export const fullscreenReducer = fullscreenSlice.reducer;
