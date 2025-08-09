import { addOrders, getOrder, hideModal, resetOrders, splitOrder } from "@/src/redux/slices/orderSlice";
import { getProduct } from "@/src/redux/slices/productSlice";
import { RootState } from "@/src/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@ui-kitten/components";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import uuid from 'react-native-uuid';
import { useDispatch, useSelector } from "react-redux";
import DropDownPicker from 'react-native-dropdown-picker';

// Dapatkan lebar layar
const { width } = Dimensions.get("window");
// Hitung lebar kartu berdasarkan 3 kolom (padding horizontal 16, margin antar kartu 8)
const CARD_WIDTH = (width - 32 - 2 * 8) / 3;

export default function Index() {
  const dispatch = useDispatch < AppDispatch > ();
  const [addOrder, setAddOrder] = useState < any[] > ([]);
  const [grandTotal, setGrandTotal] = useState < number > (0);
  const [openModalPayment, setOpenModalpayment] = useState(false)
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [disabledBtnProcess, setDisabledBtnProcess] = useState(false)
  const [disabledBtnCheckout, setDisabledBtnCheckout] = useState(false)
  const [openModalOpenBill, setOpenModalOpenBill] = useState(false);
  const [open, setOpen] = useState(false);
  const [existOrderId, setExistOrderId] = useState(null);
  const [openModalCloseBill, setOpenModalCloseBill] = useState(false)

  const [openUseOrderId, setOpenUseOrderId] = useState(false);
  const [useOrderId, setUseOrderId] = useState(null); // atau default: 'no' / 'yes'
  const [items, setItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { getproducts } = useSelector(
    (state: RootState) => state.product
  );

  const { loading, getorders, showModal } = useSelector(
    (state: RootState) => state.order
  );

  useEffect(() => {
    dispatch(getProduct());
  }, []);

  useEffect(() => {
    dispatch(getOrder());
  }, []);

  useEffect(() => {
    setItems(getorders);

  }, [getorders])

  useEffect(() => {
    setDisabledBtnProcess(addOrder.length === 0);
  }, [addOrder]);

  useEffect(() => {
    const isAllFilled = name.trim() !== '' && address.trim() !== '' && notes.trim() !== '';
    setDisabledBtnCheckout(!isAllFilled);
  }, [name, address, notes]);

  const getInitial = (text: string) => {
    const words = text.trim().split(' ');
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const handleOrder = (item: any) => {
    setAddOrder(prev => {
      const existingIndex = prev.findIndex(order => order.name === item.name);

      if (existingIndex !== -1) {
        // Sudah ada: update qty
        const updated = [...prev];
        updated[existingIndex].qtyOrder += 1;
        return updated;
      } else {
        // Belum ada: tambahkan item baru dengan qty = 1
        return [...prev, { ...item, qtyOrder: 1 }];
      }
    });

    setGrandTotal(grandTotal + item.price);
  };

  const handleDecrement = (item: any) => {
    setAddOrder((prev) => {
      const existingIndex = prev.findIndex(
        (order) => order.name === item.name
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].qtyOrder;

        if (currentQty === 1) {
          updated.splice(existingIndex, 1);
          return updated;
        } else if (currentQty > 1) {
          updated[existingIndex].qtyOrder -= 1;
          return updated;
        }
      }

      // Jika item belum ada di state, tambahkan default qty 1
      return [...prev, { ...item, qtyOrder: 1 }];
    });


    setGrandTotal(grandTotal - item.price);
  };

  const handlePaid = () => {
    const generatedOrderId = 'ORD-' + uuid.v4().toString().slice(0, 8).toUpperCase();

    const itemsWithOrderId = addOrder.map(item => ({
      ...item,
      subTotalItem: item.price * item.qtyOrder,
      order_id: generatedOrderId,
      status: 'Complete',
      cust_name: name,
      cust_address: address,
      notes: notes
    }));

    dispatch(addOrders(itemsWithOrderId));

    setName('')
    setAddress('')
    setNotes('')
    setOpenModalpayment(false)
  };

  const handleUnpaid = () => {
    const generatedOrderId = 'ORD-' + uuid.v4().toString().slice(0, 8).toUpperCase();

    const itemsWithOrderId = addOrder.map(item => ({
      ...item,
      subTotalItem: item.price * item.qtyOrder,
      order_id: generatedOrderId,
      status: 'In Progress',
    }));

    setName('')
    setAddress('')
    setNotes('')
    setOpenModalpayment(false)

    dispatch(addOrders(itemsWithOrderId));
  }

  const handlePrint = () => {

  }

  const handleOpenBill = () => {
    setOpenModalOpenBill(!openModalOpenBill);
  }

    const handleCloseBill = () => {
    setOpenModalCloseBill(!openModalCloseBill);
  }

  const handleOpenModalPayment = () => {
    setOpenModalpayment(!openModalPayment);
  }

  useEffect(() => {
    const selected = items.find(item => item.value === existOrderId);
    setSelectedOrder(selected);
  }, [existOrderId, items]);

  const handleSplitOrder = () => {
    const itemsWithOrderId = addOrder.map(item => ({
      ...item,
      subTotalItem: item.price * item.qtyOrder,
      order_id: existOrderId,
      status: 'In Progress',
      cust_name: selectedOrder?.cust_name || '',
      cust_address: selectedOrder?.cust_address || '',
      notes: notes
    }));

    dispatch(splitOrder(itemsWithOrderId));

    setNotes('')
    setExistOrderId('')
    setOpenModalOpenBill(false)
  }


  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => {
          alert('Modal has been closed.');
          dispatch(hideModal());
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <LottieView
              source={require("@/assets/lotties/Main Scene.json")}
              autoPlay
              loop={false}
              style={{ width: 200, height: 200 }}
            />
            <Text style={styles.modalText}>Pembayaran Berhasil!</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                dispatch(hideModal())
                dispatch(resetOrders())
                setAddOrder([])
                setGrandTotal(0)
              }
              }>
              <Text style={styles.textStyle}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {openModalPayment && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={openModalPayment}
          onRequestClose={() => {
            alert('Modal has been closed.');
            dispatch(hideModal());
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.headerContainer}>
                <TouchableOpacity onPress={handleOpenModalPayment} style={styles.iconWrapper}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.modalTitle}>Detail Pembeli</Text>
                </View>

                <View style={styles.iconPlaceholder} />
              </View>

              {/* Input Nama */}
              <TextInput
                placeholder="Nama Pelanggan"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
              {/* Input Alamat */}
              <TextInput
                placeholder="Alamat"
                style={styles.input}
                value={address}
                onChangeText={setAddress}
              />
              {/* Input Catatan */}
              <TextInput
                placeholder="Catatan (Notes)"
                style={[styles.input, { height: 60 }]}
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              {/* Tombol-tombol */}
              <View style={styles.buttonRow}>
                <Button disabled={disabledBtnCheckout} status="warning" onPress={handlePaid}>Print</Button>
                <Button disabled={disabledBtnCheckout} status="danger" onPress={handleUnpaid}>Unpaid</Button>
                {loading ? (
                  <ActivityIndicator />
                ) : (
                  <Button disabled={disabledBtnCheckout} status="success" onPress={handlePaid}>Paid</Button>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
      {openModalOpenBill && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={openModalOpenBill}
          onRequestClose={() => {
            alert('Modal has been closed.');
            dispatch(hideModal());
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={styles.centeredView} keyboardShouldPersistTaps="handled">
              <View style={styles.modalView}>
                {/* Header */}
                <View style={styles.headerContainer}>
                  <TouchableOpacity onPress={handleOpenBill} style={styles.iconWrapper}>
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>

                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.modalTitle}>Detail Pembeli</Text>
                  </View>

                  <View style={styles.iconPlaceholder} />
                </View>

                {/* Use Order ID Existing */}
                {/* <View style={{ marginBottom: 16, zIndex: 3000 }}>
                  <Text style={{ marginBottom: 6, fontWeight: 'bold' }}>Use Order ID Existing</Text>
                  <DropDownPicker
                    open={openUseOrderId}
                    value={useOrderId}
                    items={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' },
                    ]}
                    setOpen={setOpenUseOrderId}
                    setValue={setUseOrderId}
                    setItems={setItems} // Gunakan setItems asli jika perlu ubah
                    placeholder="Pilih opsi"
                    searchable={false}
                    zIndex={3000}
                    zIndexInverse={1000}
                  />
                </View> */}

                {/* Dropdown Order ID jika Yes */}
                <>                  <View style={{ marginBottom: 16, zIndex: 2000 }}>
                  <Text style={{ marginBottom: 6, fontWeight: 'bold' }}>Select Existing Order</Text>
                  <DropDownPicker
                    open={open}
                    value={existOrderId}
                    items={items}
                    setOpen={setOpen}
                    setValue={setExistOrderId}
                    setItems={setItems}
                    searchable={true}
                    placeholder="Cari Order ID"
                    zIndex={2000}
                    zIndexInverse={3000}
                    listMode="SCROLLVIEW"
                  />
                </View>
                  <TextInput
                    placeholder="Catatan (Notes)"
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                  />
                </>

                {/* Tombol */}
                <View style={[styles.buttonRow, { marginTop: 24 }]}>
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Button status="success" onPress={handleSplitOrder}>Process</Button>
                  )}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      )}
      {openModalCloseBill && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={openModalCloseBill}
          onRequestClose={() => {
            alert('Modal has been closed.');
            dispatch(hideModal());
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={styles.centeredView} keyboardShouldPersistTaps="handled">
              <View style={styles.modalView}>
                {/* Header */}
                <View style={styles.headerContainer}>
                  <TouchableOpacity onPress={handleCloseBill} style={styles.iconWrapper}>
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>

                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.modalTitle}>Close Bill</Text>
                  </View>

                  <View style={styles.iconPlaceholder} />
                </View>

                {/* Use Order ID Existing */}
                {/* <View style={{ marginBottom: 16, zIndex: 3000 }}>
                  <Text style={{ marginBottom: 6, fontWeight: 'bold' }}>Use Order ID Existing</Text>
                  <DropDownPicker
                    open={openUseOrderId}
                    value={useOrderId}
                    items={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' },
                    ]}
                    setOpen={setOpenUseOrderId}
                    setValue={setUseOrderId}
                    setItems={setItems} // Gunakan setItems asli jika perlu ubah
                    placeholder="Pilih opsi"
                    searchable={false}
                    zIndex={3000}
                    zIndexInverse={1000}
                  />
                </View> */}

                {/* Dropdown Order ID jika Yes */}
                <>                  
                <View style={{ marginBottom: 16, zIndex: 2000 }}>
                  <Text style={{ marginBottom: 6, fontWeight: 'bold' }}>Find Order</Text>
                  <DropDownPicker
                    open={open}
                    value={existOrderId}
                    items={items}
                    setOpen={setOpen}
                    setValue={setExistOrderId}
                    setItems={setItems}
                    searchable={true}
                    placeholder="Cari Order ID"
                    zIndex={2000}
                    zIndexInverse={3000}
                    listMode="SCROLLVIEW"
                  />
                </View>
                  <TextInput
                    placeholder="Catatan (Notes)"
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                  />
                </>

                {/* Tombol */}
                <View style={[styles.buttonRow, { marginTop: 24 }]}>
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Button status="success" onPress={handleSplitOrder}>Process</Button>
                  )}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>


      )}
      {/* Section: Order List + Grand Total */}
      <View style={{ flex: 1, padding: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Order Summary</Text>

        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10 }}>
          {addOrder.length > 0 ? (
            <ScrollView style={{ marginBottom: 10 }}>
              {addOrder.map((item, index) => (
                <View key={index} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                    <Text style={{ color: '#666' }}>{new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(item.price)} × {item.qtyOrder}</Text>
                    <Text style={{ color: '#000' }}>Subtotal: {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(item.price * item.qtyOrder)}</Text>
                  </View>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity onPress={() => handleDecrement(item)}>
                      {item.qtyOrder === 1 ? (
                        <Ionicons name="trash" size={20} color="#333" />
                      ) : (
                        <Ionicons name="remove" size={20} color="#333" />
                      )}
                    </TouchableOpacity>

                    <Text style={styles.qtyText}>{item.qtyOrder}</Text>

                    <TouchableOpacity onPress={() => handleOrder(item)}>
                      <Ionicons name="add" size={20} color="#333" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ fontStyle: 'italic', color: '#aaa' }}>Belum ada order</Text>
            </View>

          )}

          {/* Grand Total */}
          <View style={{ borderTopWidth: 1, borderColor: '#eee', paddingTop: 10, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Grand Total:</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e88e5' }}>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(grandTotal)}
              </Text>
            </View>
            <View style={{ display: "flex", flexDirection: "row", gap: "2" }}>
              {/* <Button status="warning" onPress={() => handlePaid()}>Print</Button>
              <Button status="danger" onPress={() => handleUnpaid()}>Unpaid</Button> */}
              <Button disabled={disabledBtnProcess} status="warning" onPress={handleOpenBill}>Split Order</Button>
              <Button status="warning" onPress={handleCloseBill}>Close Bill</Button>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Button disabled={disabledBtnProcess} status="success" onPress={() => handleOpenModalPayment()}>Process</Button>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Section: Product List (FlatList) */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={getproducts}
          numColumns={3}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleOrder(item)}
            >
              <View style={styles.initialContainer}>
                <Text style={styles.initialText}>{getInitial(item.name)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>Rp {item.price}</Text>
                <Text style={styles.price}>Qty: {item.qty}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );



}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    margin: 4,
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2, // shadow Android
    shadowColor: "#000", // shadow iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: 100,
  },
  info: {
    padding: 10,
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    marginTop: 4,
    fontSize: 13,
    color: '#888',
  },
  initialContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#555',
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    alignItems: "center",
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end", // ⬅️ ini bikin tombol pindah ke kanan
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center', // ini biar semua elemen sejajar vertikal
    marginBottom: 16,
  },

  closeWrapper: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeIcon: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    alignItems: "baseline"
  },

  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },

  iconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconPlaceholder: {
    width: 32, // Sama seperti iconWrapper, agar title tetap center
  },

});
