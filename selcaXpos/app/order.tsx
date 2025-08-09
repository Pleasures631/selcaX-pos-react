import { getOrder } from '@/src/redux/slices/orderSlice';
import { AppDispatch, RootState } from '@/src/redux/store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Button, DataTable, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

const itemsPerPage = 10;

type SortKey = 'name' | 'qty' | 'amount' | 'status' | '';
type SortOrder = 'asc' | 'desc';

export default function Order() {
    const dispatch = useDispatch<AppDispatch>();
    const [page, setPage] = useState(0);
    const { width } = useWindowDimensions();
    const { getorders } = useSelector((state: RootState) => state.order);

    const [sortKey, setSortKey] = useState<SortKey>('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        dispatch(getOrder());
    }, []);

    useEffect(() => {
        setPage(0);
      }, [searchText]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const filteredOrders = getorders.filter((order) => {
      
        const lowerSearch = searchText.toLowerCase();
        const nameMatch = order.name?.toLowerCase().includes(lowerSearch);
        const orderIdMatch = order.order_id?.toLowerCase().includes(lowerSearch);
      
        return nameMatch || orderIdMatch;
      });
      

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (!sortKey) return 0;

        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
    });

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, sortedOrders.length);

    const handleDownloadReport = async () => {
        try {
            const exportData = getorders.map(order => ({
                Nama: order.name,
                Qty: order.qty,
                Harga: order.amount,
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');

            const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

            const filename = FileSystem.documentDirectory + 'laporan-order.xlsx';
            await FileSystem.writeAsStringAsync(filename, wbout, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await Sharing.shareAsync(filename);
        } catch (error) {
            console.error('Gagal buat laporan:', error);
        }
    };

    const renderSortIcon = (key: SortKey) => {
        if (sortKey !== key) return 'sort';
        return sortOrder === 'asc' ? 'arrow-up' : 'arrow-down';
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Button
                    mode="elevated"
                    icon="download"
                    onPress={handleDownloadReport}
                    style={{ borderRadius: 10, elevation: 2 }}
                    contentStyle={{ paddingVertical: 6, paddingHorizontal: 12 }}
                    labelStyle={{ fontSize: 14, fontWeight: '600' }}
                >
                    Download Report
                </Button>
            </View>

            {/* Search Input */}
            <TextInput
                placeholder="Cari nama barang..."
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
            />

            <View style={styles.tableContainer}>
                <ScrollView horizontal>
                    <View style={{ minWidth: width + 300 }}>
                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title style={{ flex: 2 }}>Order ID</DataTable.Title>
                                <DataTable.Title style={{ flex: 2 }} onPress={() => toggleSort('name')}>
                                    Nama Barang
                                    <IconButton icon={renderSortIcon('name')} size={14} />
                                </DataTable.Title>
                                <DataTable.Title style={{ flex: 1 }} onPress={() => toggleSort('qty')}>
                                    Qty
                                    <IconButton icon={renderSortIcon('qty')} size={14} />
                                </DataTable.Title>
                                <DataTable.Title style={{ flex: 2 }} onPress={() => toggleSort('amount')}>
                                    Harga
                                    <IconButton icon={renderSortIcon('amount')} size={14} />
                                </DataTable.Title>
                                <DataTable.Title style={{ flex: 2 }} onPress={() => toggleSort('status')}>
                                    Status
                                    <IconButton icon={renderSortIcon('status')} size={14} />
                                </DataTable.Title>
                                <DataTable.Title style={{ flex: 1 }}>Aksi</DataTable.Title>
                            </DataTable.Header>

                            {sortedOrders.slice(from, to).map((order) => (
                                <DataTable.Row key={order.id}>
                                    <DataTable.Cell style={{ flex: 2 }}>{order.order_id}</DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 2 }}>{order.name}</DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 1 }}>{order.qty}</DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 2 }}>{order.amount}</DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 2 }}>
                                        <View style={{
                                            backgroundColor: order.status !== 'Complete' ? '#f44336' : '#4CAF50', // merah / hijau
                                            paddingVertical: 4,
                                            paddingHorizontal: 8,
                                            borderRadius: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                                                {order.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 1 }}>
                                        <IconButton
                                            icon="pencil"
                                            size={18}
                                            onPress={() => console.log('Edit', order.id)}
                                        />
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>
                    </View>
                </ScrollView>
            </View>

            <View style={styles.paginationContainer}>
                <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.ceil(sortedOrders.length / itemsPerPage)}
                    onPageChange={(newPage) => setPage(newPage)}
                    label={`${from + 1}-${to} dari ${sortedOrders.length}`}
                    showFastPaginationControls
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    header: {
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    tableContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
        padding: 4,
    },
    paginationContainer: {
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
    },
});
