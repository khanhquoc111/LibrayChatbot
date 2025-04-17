import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import supabase from './API/Supabase';
import styles from './UpdatePasswordStyle';

const UpdatePasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  // Hàm xử lý cập nhật mật khẩu mới
  const handleUpdatePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setMessage('Vui lòng nhập đầy đủ mật khẩu!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu không khớp!');
      return;
    }

    if (!email) {
      setMessage('Không xác định được email người dùng!');
      return;
    }

    // Cập nhật mật khẩu mới trong bảng "User" dựa theo email
    const { data, error } = await supabase
      .from('User')
      .update({ Password: newPassword })
      .eq('Email', email);

    if (error) {
      setMessage(`Lỗi: ${error.message}`);
    } else {
      Alert.alert(
        'Thành công',
        'Cập nhật mật khẩu thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('LoginScreen'),
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require('./assets/pexels-spiritsofmilly-3913572.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        {styles.overlay && <View style={styles.overlay} />}
        <View style={styles.container}>
          <Text style={styles.title}>Cập nhật mật khẩu mới</Text>

          <TextInput
            style={styles.input}
            placeholder="Mật khẩu mới"
            placeholderTextColor="#999"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu mới"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
            <Text style={styles.buttonText}>Cập nhật mật khẩu</Text>
          </TouchableOpacity>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default UpdatePasswordScreen;
