import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import supabase from "./API/Supabase";
import { getUserThreadID } from './API/supabaseFunction';
import styles from "./LoginStyle";

// Lưu ý: Không nên để API key trong code client thật sự, đây chỉ là ví dụ.
const API_KEY =
  "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";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hàm tạo thread cho người dùng nếu chưa có
  const createThreadForUser = async (userID) => {
    try {
      console.log("🔄 Creating thread...");
      const response = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Thread created:", data);

      if (data?.id) {
        const threadID = data.id;
        // Cập nhật lại ThreadID cho tài khoản trong bảng user
        const { error } = await supabase
          .from("User")
          .update({ ThreadID: threadID })
          .eq("UserID", userID);
        if (error) {
          console.error("Error updating user with new thread:", error.message);
        }
        return threadID;
      } else {
        console.error(
          "❌ Thread creation failed:",
          JSON.stringify(data, null, 2)
        );
        return null;
      }
    } catch (error) {
      console.error("🚨 Error creating thread:", error.message);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      console.log("Vui lòng nhập đầy đủ email và password");
      return;
    }
  
    try {
      // Truy vấn bảng User lấy ra UserID và ThreadID
      const { data, error } = await supabase
        .from("User")
        .select("UserID, ThreadID")
        .eq("Email", email)
        .eq("Password", password)
        .single();
  
      if (error || !data) {
        console.log(
          "Đăng nhập thất bại:",
          error ? error.message : "Không tìm thấy tài khoản"
        );
      } else {
        const userID = data.UserID;
        let threadID = data.ThreadID; // Có thể null
  
        // Kiểm tra lại từ DB bằng hàm getUserThreadID nếu chưa có threadID trong kết quả truy vấn
        if (!threadID) {
          threadID = await getUserThreadID(email);
          console.log('Thread ID tu bang: ', threadID);
        }
  
        // Nếu vẫn chưa có, mới tạo thread mới
        if (!threadID) {
          threadID = await createThreadForUser(userID);
          if (!threadID) {
            console.error("Không tạo được thread cho người dùng");
            return;
          }
        }
  
        console.log("Đăng nhập thành công!", { userID, threadID });
        // Chuyển sang ChatScreen, truyền UserID và ThreadID
        navigation.navigate("ChatScreen", { userID, threadID });
      }
    } catch (err) {
      console.log("Lỗi không xác định khi đăng nhập:", err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("./assets/pexels-spiritsofmilly-3913572.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.container}>
          <Text style={styles.title}>Welcome to My Chatbot</Text>
          <Text style={styles.subtitle}>Please login to continue</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#ccc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPasswordScreen")}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default LoginScreen;
