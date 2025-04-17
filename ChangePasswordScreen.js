// ChangePasswordScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { updatePassword } from "./API/supabaseFunction"; // Điều chỉnh đường dẫn cho phù hợp
import { useNavigation } from "@react-navigation/native";

const ChangePasswordScreen = ({ route }) => {
  const { userID } = route.params; // Nhận userID từ route
  const navigation = useNavigation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpdatePassword = async () => {
    // Gọi hàm updatePassword, trả về error nếu mật khẩu cũ không khớp
    const result = await updatePassword(userID, oldPassword, newPassword);
    if (result.error) {
      setErrorMessage("Mật khẩu không chính xác. Vui lòng nhập lại");
    } else {
      Alert.alert("Thành công", "Cập nhật mật khẩu thành công", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cập nhật mật khẩu</Text>
      <TextInput
        placeholder="Mật khẩu cũ"
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#1D1616"
        value={oldPassword}
        onChangeText={setOldPassword}
      />
      <TextInput
        placeholder="Mật khẩu mới"
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#1D1616"
        value={newPassword}
        onChangeText={setNewPassword}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Cập nhật</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DBDBDB",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    color: "#1D1616",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#1D1616",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: "#1D1616",
  },
  button: {
    backgroundColor: "#A08963",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#1D1616",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
});

export default ChangePasswordScreen;
