import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Location } from "types/location";

export type InvestmentStrategy = "upfront" | "uniform";

export interface LocationState {
  location: Location;
  disabledState: Boolean;
}

const initialState: LocationState = {
  location: {
    id: "",
    name: "Null Island",
    center: [0, 0],
    zoom: 15,
    evInsitesEnabled: false,
  },
  disabledState: false,
};

export const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocation(state, { payload }: PayloadAction<Location>) {
      state.location = payload;
    },
    setDisabledState(state, { payload }: PayloadAction<Boolean>) {
      state.disabledState = payload;
    },
  },
});

export const { setLocation, setDisabledState } = locationSlice.actions;

export default locationSlice.reducer;
