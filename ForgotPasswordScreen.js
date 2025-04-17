import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import supabase from './API/Supabase';
import styles from './ForgotPasswordStyle';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Xóa message khi màn hình được focus lại
  useFocusEffect(
    useCallback(() => {
      setMessage('');
    }, [])
  );

  // Xử lý xác nhận email và chuyển đến màn hình cập nhật mật khẩu
  const handleResetPassword = async () => {
    if (!email.trim()) {
      setMessage('Vui lòng nhập email!');
      return;
    }

    // Truy vấn bảng "User" để kiểm tra email có tồn tại không
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('Email', email)
      .maybeSingle();

    if (error || !data) {
      setMessage('Email không tồn tại!');
      return;
    }

    // Nếu email tồn tại, chuyển sang màn hình UpdatePassword và truyền email qua params
    navigation.navigate('UpdatePasswordScreen', { email });
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
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <Text style={styles.subtitle}>
            Nhập email của bạn để đặt lại mật khẩu
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#fff"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Xác nhận</Text>
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

export default ForgotPasswordScreen;
