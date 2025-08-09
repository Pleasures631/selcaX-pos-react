import { API } from "@/src/api/api_service";
import { getOrders, Orders, splitOrders } from "@/src/types/order";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface OrderState {
    showModal: boolean;
    loading: boolean;
    error: string | null;
    orders: Orders[];
    getorders: getOrders[];
    splitorder: splitOrders[];
}

const initialState: OrderState = {
    showModal: false,
    loading: false,
    error: null,
    orders: [],
    getorders: [],
    splitorder: [],
};

export const addOrders = createAsyncThunk(
    "order/add",
    async (payload: Orders[], { rejectWithValue }) => {
        try {
            const res = await Promise.all(
                payload.map(async (item) => {
                    console.log(payload);
                    return await axios.post(API.addOrder, {
                        item_name: item.name,
                        amount: String(item.subTotalItem),
                        qty: String(item.qtyOrder),
                        order_id: String(item.order_id),
                        status: String(item.status),
                        cust_name: String(item.cust_name),
                        cust_address: String(item.cust_address),
                        notes: String(item.notes),
                    });
                })
            );
            return res.map((res) => res.data);
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || "Tambah produk gagal"
            );
        }
    }
);

export const getOrder = createAsyncThunk(
    "order/get",
    async (_: void, { rejectWithValue }) => {
        try {
            const res = await axios.get(API.getOrder);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || "Gagal mengambil produk"
            );
        }
    }
);

export const splitOrder = createAsyncThunk(
    "order/split",
    async (payload: splitOrders[], { rejectWithValue }) => {
        try {
            const res = await Promise.all(
                payload.map(async (item) => {
                    return await axios.post(API.splitOrder, {
                        item_name: item.name,
                        amount: String(item.subTotalItem),
                        qty: String(item.qtyOrder),
                        order_id: String(item.order_id),
                        status: "In Progress",
                        notes: String(item.notes),
                        cust_name: String(item.cust_name),
                        cust_address: String(item.cust_address),
                    });
                })
            );
            return res.map((res) => res.data);
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || "Tambah produk gagal"
            );
        }
    }
);

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        hideModal: (state) => {
            state.showModal = false;
        },
        resetOrders: (state) => {
            state.orders = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.showModal = false;
            })
            .addCase(
                addOrders.fulfilled,
                (state, action: PayloadAction<Orders[]>) => {
                    const order = action.payload[0]; // ambil order pertama
                    state.loading = false;
                    if (order) {
                        state.getorders.push({
                            label: `${order.order_id} - ${order.cust_name}`,
                            value: order.order_id,
                            cust_name: order.cust_name,
                            cust_address: order.cust_address,
                        });
                    }

                    state.orders.push(...action.payload);
                    state.showModal = true;
                }
            )
            .addCase(addOrders.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
                state.showModal = false;
            })

            .addCase(getOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getOrder.fulfilled,
                (state, action: PayloadAction<getOrders[]>) => {
                    state.loading = false;
                    state.getorders = action.payload;
                }
            )
            .addCase(getOrder.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(splitOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.showModal = false;
            })
            .addCase(
                splitOrder.fulfilled,
                (state, action: PayloadAction<Orders[]>) => {
                    state.loading = false;
                    // state.orders = action.payload;
                    state.splitorder.push(...action.payload);
                    state.showModal = true;
                }
            )
            .addCase(splitOrder.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
                state.showModal = false;
            });
    },
});

export const { hideModal, resetOrders } = orderSlice.actions;

export default orderSlice.reducer;
