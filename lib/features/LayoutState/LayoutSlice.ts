"use client";

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface LayoutState {
    title: string;
  }

const initialState: LayoutState = {
  title: '',
};

const LayoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string | undefined>) => {
      state.title = action.payload !== undefined ? action.payload : '';
    },
  },
});

export const { setTitle } = LayoutSlice.actions;
export default LayoutSlice.reducer;
