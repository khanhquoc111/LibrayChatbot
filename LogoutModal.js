import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import modalStyles from './LogoutModalStyle'; // import style riêng

/**
 * LogoutModal là một component Modal chứa nút đăng xuất.
 * 
 * @param {boolean} visible - Trạng thái hiển thị modal.
 * @param {function} onClose - Hàm đóng modal.
 * @param {function} onLogout - Hàm thực hiện đăng xuất.
 */
const LogoutModal = ({ visible, onClose, onLogout }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>Bạn có chắc muốn đăng xuất?</Text>

          <View style={modalStyles.buttonRow}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={modalStyles.buttonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.logoutButton]}
              onPress={onLogout}
            >
              <Text style={modalStyles.buttonText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;
