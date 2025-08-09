import { API } from "@/src/api/api_service";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AuthState, LoginPayload } from "../../types/auth";

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (payload: LoginPayload, { rejectWithValue }) => {
        try {
            const formData = new URLSearchParams();
            formData.append("username", payload.username);
            formData.append("password", payload.password);

            const res = await axios.post(API.login, formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            console.log("[LOGIN RESPONSE]", res);
            return res.data;
        } catch (err: any) {
            console.log("[LOGIN PAYLOAD]", err);
            return rejectWithValue(err.response?.data?.message || "Login gagal");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<{access_token: string; token_type:string}>) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.user = null;
            })
            .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
