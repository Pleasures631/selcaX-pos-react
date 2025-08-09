import { addProduct, resetProduct } from "@/src/redux/slices/productSlice"
import { addProductSchema } from "@/src/schemas/add_product"
import { Formik } from "formik"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { Button, Card, TextInput } from "react-native-paper"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../src/redux/store"

export default function AddItem() {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector(
        (state: RootState) => state.product
    );

    const handleAddProduct = async (values, resetForm) => {
        const resultAction = await dispatch(addProduct(values));

        if (addProduct.fulfilled.match(resultAction)) {
            resetForm();
            dispatch(resetProduct());
        } else {
            console.error("Gagal tambah produk:", resultAction);
        }
    }

    return (
        <View style={styles.wrapper}>
            <Card style={styles.card}>
                <Card.Title title="Tambah Produk" />
                <Card.Content>
                    <Formik
                        initialValues={{ product_name: "", price: "", qty: "" }}
                        validationSchema={addProductSchema}
                        onSubmit={(values, { resetForm }) => {
                            handleAddProduct(values, resetForm);
                        }}>
                        {({
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            values,
                            errors,
                            touched,
                        }) => (
                            <View>
                                <TextInput
                                    label="Product Name"
                                    mode="outlined"
                                    style={styles.input}
                                    onChangeText={handleChange("product_name")}
                                    onBlur={handleBlur("product_name")}
                                    value={values.product_name}
                                    error={!!(errors.product_name && touched.product_name)}
                                />
                                {errors.product_name && touched.product_name && (
                                    <Text style={styles.error}>{errors.product_name}</Text>
                                )}

                                <TextInput
                                    label="Price"
                                    mode="outlined"
                                    keyboardType="numeric"
                                    style={styles.input}
                                    onChangeText={handleChange("price")}
                                    onBlur={handleBlur("price")}
                                    value={values.price}
                                    error={!!(errors.price && touched.price)}
                                />
                                {errors.price && touched.price && (
                                    <Text style={styles.error}>{errors.price}</Text>
                                )}

                                <TextInput
                                    label="Quantity"
                                    mode="outlined"
                                    keyboardType="numeric"
                                    style={styles.input}
                                    onChangeText={handleChange("qty")}
                                    onBlur={handleBlur("qty")}
                                    value={values.qty}
                                    error={!!(errors.qty && touched.qty)}
                                />
                                {errors.qty && touched.qty && (
                                    <Text style={styles.error}>{errors.qty}</Text>
                                )}

                                {loading ? (
                                    <ActivityIndicator style={{ marginTop: 16 }} />
                                ) : (
                                    <Button
                                        mode="contained"
                                        onPress={handleSubmit as any}
                                        style={styles.button}
                                    >
                                        Add Product
                                    </Button>
                                )}

                                {error && <Text style={styles.error}>{error}</Text>}
                            </View>
                        )}
                    </Formik>
                </Card.Content>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    card: {
        padding: 8,
        borderRadius: 12,
        elevation: 4,
    },
    input: {
        marginBottom: 10,
        backgroundColor: "white",
    },
    error: {
        color: "red",
        marginBottom: 8,
        fontSize: 12,
    },
    button: {
        marginTop: 12,
    },
});
