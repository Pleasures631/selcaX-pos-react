import { Ionicons } from '@expo/vector-icons';
import { MenuItem, OverflowMenu } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../src/redux/slices/authSlice';

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);

  const toggleMenu = () => setVisible(!visible);

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/');
  }

  const renderMenuIcon = () => (
    <TouchableOpacity onPress={toggleMenu} style={{ marginRight: 16 }}>
      <Ionicons name="ellipsis-vertical" size={24} color="black" />
    </TouchableOpacity>
  );

  const HeaderRight = () => (
    <OverflowMenu
      anchor={renderMenuIcon}
      visible={visible}
      onBackdropPress={toggleMenu}
    >
      <MenuItem title="Logout" onPress={handleLogout} />
    </OverflowMenu>
  );

  return (
    <Drawer>
      <Drawer.Screen
        name="dashboard_screen"
        options={{
          title: 'Dashboard',
          headerRight: () => <HeaderRight />,
        }}
      />
    </Drawer>
  );
}