import React from 'react';
import { View, StyleSheet } from 'react-native';
import ProfilePage from '../components/UserManagement/profilePage';

const UserManagement = ({ userId }) => {
  return (
    <View style={styles.container}>
      <ProfilePage userId={userId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
});

export default UserManagement;