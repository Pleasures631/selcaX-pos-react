import { store } from '@/src/redux/store';
import * as eva from '@eva-design/eva';
import { Ionicons } from '@expo/vector-icons';
import { ApplicationProvider } from '@ui-kitten/components';
import { Drawer } from "expo-router/drawer";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from "react-redux";



export default function RootLayout() {
  const [showMenu, setShowMenu] = useState(false);

  const handleClickToggle = () => {
    setShowMenu(!showMenu);
  }

  const handleProfile = () => {
    setShowMenu(false)
  }

  const handleLogout = () => {

  }

  return (
    <PaperProvider>
    <ApplicationProvider {...eva} theme={eva.light}>
     <Provider store={store}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Dashboard',
            title: 'Dashboard',
            drawerIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
            headerRight: () =>
              <View style={{ marginRight: 15 }}>
                <TouchableOpacity onPress={handleClickToggle}>
                  <Ionicons name="ellipsis-vertical" size={25} color="black" />
                </TouchableOpacity>
                {showMenu && (
                  <View style={styles.menu}>
                    <TouchableOpacity onPress={handleProfile}>
                      <Text style={styles.menuItem}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout}>
                      <Text style={styles.menuItem}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            
          }} />
        <Drawer.Screen
          name="add_item"
          options={{
            drawerLabel: 'Add Product',
            title: 'Add Product',
            drawerIcon: ({ color, size }) => <Ionicons name="add" size={size} color={color} />,
            headerRight: () =>
              <View style={{ marginRight: 15 }}>
                <TouchableOpacity onPress={handleClickToggle}>
                  <Ionicons name="ellipsis-vertical" size={25} color="black" />
                </TouchableOpacity>
                {showMenu && (
                  <View style={styles.menu}>
                    <TouchableOpacity onPress={handleProfile}>
                      <Text style={styles.menuItem}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout}>
                      <Text style={styles.menuItem}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
          }}
        />
        <Drawer.Screen
          name="order"
          options={{
            drawerLabel: 'Order',
            title: 'Order',
            drawerIcon: ({ color, size }) => <Ionicons name="add" size={size} color={color} />,
            headerRight: () =>
              <View style={{ marginRight: 15 }}>
                <TouchableOpacity onPress={handleClickToggle}>
                  <Ionicons name="ellipsis-vertical" size={25} color="black" />
                </TouchableOpacity>
                {showMenu && (
                  <View style={styles.menu}>
                    <TouchableOpacity onPress={handleProfile}>
                      <Text style={styles.menuItem}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout}>
                      <Text style={styles.menuItem}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            
          }} />
      </Drawer>;
    </GestureHandlerRootView>
    </Provider>
    </ApplicationProvider>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    top: 35,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 6,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 999,
  },

  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333'
  }
});
