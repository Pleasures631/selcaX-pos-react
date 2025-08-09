import * as Yup from "yup";

export const addProductSchema = Yup.object().shape({
    product_name: Yup.string().required("Product name wajib diisi"),
    price: Yup.number().required("Harga wajib diisi").min(1, "Minimal 1"),
    qty: Yup.number().required("Qty wajib diisi").min(1, "Minimal 1"),
});
