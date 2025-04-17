// npm install react-native-modal
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";

const AccountMenu = ({ visible, onClose, userID}) => {
  const navigation = useNavigation();

  const signOut = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  const confirmSignOut = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: signOut,
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleUpdatePassword = () => {
    onClose(); // Đóng modal trước khi chuyển màn hình
    navigation.navigate("ChangePasswordScreen", { userID });
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      backdropOpacity={0.3}
      style={styles.modal}
    >
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handleUpdatePassword}>
          <Text style={styles.menuText}>Cập nhật mật khẩu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={confirmSignOut}>
          <Text style={styles.menuText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    top: 58,
  },
  menuContainer: {
    width: "40%",
    backgroundColor: "#A08963",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuText: {
    fontSize: 16,
    color: "#DBDBDB",
  },
});

export default AccountMenu;
