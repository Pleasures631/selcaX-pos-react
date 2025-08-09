import { API } from "@/src/api/api_service";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { getProducts, Products } from "../../types/product";

interface ProductState {
    loading: boolean;
    error: string | null;
    products: Products[];
    getproducts: getProducts[];
}

const initialState: ProductState = {
    loading: false,
    error: null,
    products: [],
    getproducts: []
};

export const addProduct = createAsyncThunk(
    "product/add",
    async (payload: Products, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                API.products,
                {
                    name: payload.product_name,
                    price: payload.price,
                    qty: payload.qty,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || "Tambah produk gagal"
            );
        }
    }
);

export const getProduct = createAsyncThunk(
    "product/get",
    async (_: void, { rejectWithValue }) => {
        try {
            const res = await axios.get(API.getProducts);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || "Gagal mengambil produk"
            );
        }
    }
);

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        resetProduct: (state) => {
            state.products = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                addProduct.fulfilled,
                (state, action: PayloadAction<Products[]>) => {
                    state.loading = false;
                    state.products = action.payload;
                    state.getproducts.push(action.payload);
                }
            )
            .addCase(addProduct.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getProduct.fulfilled,
                (state, action: PayloadAction<getProducts[]>) => {
                    state.loading = false;
                    state.getproducts = action.payload;
                }
            )
            .addCase(getProduct.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetProduct } = productSlice.actions;

export default productSlice.reducer;
