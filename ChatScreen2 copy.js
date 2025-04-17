// npm install react-native-animatable
// npm install uuid
// npm install react-native-get-random-values

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  findBook,
  hasBook,
  bookIn4,
  checkFine,
  Account,
  Chekouts,
  findBooksByKeyword,
  getUserInfo,
} from "./API/supabaseFunction";
import * as Animatable from "react-native-animatable";
import { useRoute } from "@react-navigation/native";
import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";
import AccountMenu from "./AccountMenu";

// {"threadID": "thread_jRKvlP7KMNYsWDZln52irdWk", "userID": 1}
const threadId = "thread_jRKvlP7KMNYsWDZln52irdWk";

const API_KEY =
  "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";
const ASSISTANT_ID = "asst_kHUXL5hpZVISj4ytuhHcCXzJ"; // BoBo
const FINE_TUNING = "ft:gpt-4o-mini-2024-07-18:phamhuuhung::B7LmIhDo";
//const USER_ID = 1;
const initialMessages = [
  { id: "1", type: "assistant", text: "Chào bạn, tôi có thể giúp gì cho bạn?" },
];

const ChatScreen2 = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [nameOfBook, setNameOfBook] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const flatListRef = useRef(null);
  const route = useRoute();
  const { userID, threadID } = route.params;
  const currentUserID = userID;
  const [avatarUri, setAvatarUri] = useState(null);
  const [UserName, setUserName] = useState("");

  // Hiệu ứng cập nhật 3 dấu chấm suy nghĩ
  useEffect(() => {
    let interval;
    if (isThinking) {
      let dotCount = 0;
      interval = setInterval(() => {
        dotCount = (dotCount + 1) % 4; // 0 -> 1 -> 2 -> 3 -> 0...
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.id === "thinking" ? { ...m, text: ".".repeat(dotCount) } : m
          )
        );
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isThinking]);

  // Tự động cuộn xuống dưới khi có tin nhắn mới
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Lấy avatar
  useEffect(() => {
    async function loadAvatar() {
      const info = await getUserInfo(currentUserID); // currentUserId được lấy từ LoginScreen
      setAvatarUri(info.Avatar);
    }
    loadAvatar();
  }, [currentUserID]);

  //Lấy User name
  useEffect(() => {
    async function loadUserName() {
      const info = await getUserInfo(currentUserID);
      const fullName = (info.FullName || "").trim(); 
      const nameParts = fullName.split(" ");
      const firstName = nameParts[nameParts.length - 1];
      setUserName(firstName);
    }
    loadUserName();
  }, [currentUserID]);

  // useEffect(() => {
  //   console.log("UserName:", UserName);
  // }, [UserName]);
  

  // Sau khi lấy được UserName, cập nhật tin nhắn chào đầu tiên
  useEffect(() => {
    if (UserName) {
      setMessages([
        {
          id: "1",
          type: "assistant",
          text: `Chào ${UserName}, tôi có thể giúp gì cho bạn?`,
        },
      ]);
    }
  }, [UserName]);

  const sendMessage = async () => {
    if (!threadId) {
      console.error("❌ Thread ID not available");
      alert("Hệ thống gặp lỗi");
      return;
    }

    if (input.trim() === "") return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      text: input,
    };
    // Thêm tin nhắn của người dùng và hiệu ứng suy nghĩ (được nhận dạng bằng id "thinking")
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: "thinking", type: "assistant", text: "" },
    ]);
    setInput("");
    setIsThinking(true);

    var fetchedData = await classifyFunctions(input);

    // Chỉnh sửa dữ liệu cho đẹp hơn
    const formattedData =
      Array.isArray(fetchedData) && fetchedData.length > 0
        ? JSON.stringify(fetchedData, null, 2)
        : "Không có dữ liệu";

    const prompt = {
      role: "user",
      content: `Đây là input của người dùng : ${input}. \nĐây là dữ liệu từ database : ${formattedData}. \
Hãy trả lời dựa trên dữ liệu trên. Nếu dữ liệu không rỗng, hãy liệt kê các cuốn sách và thông tin chi tiết, không tự sinh thêm thông tin khác. \
Nếu không có dữ liệu từ database thì bạn hãy tự xử lý câu hỏi của người dùng, sau khi xử lý xong rồi thì check lại nếu input người dùng không nằm trong phạm \
vi thư viện thì hãy phản hồi thêm là : "Tôi là chatbot thư viện nên bạn hãy hỏi những chủ đề liên quan đến thư viện" hoặc \
"Vui lòng cung cấp tên sách hoặc yêu cầu của bạn rõ ràng hơn" (phần này hãy xuống hàng để dễ đọc).`,
    };

    try {
      console.log("📤 Sending message:", userMessage);
      const response = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify(prompt),
        }
      );

      const data = await response.json();
      console.log("✅ Message sent:", data);

      if (data?.id) {
        await runAssistant();
      } else {
        console.error(
          "❌ Error sending message:",
          JSON.stringify(data, null, 2)
        );
      }
    } catch (error) {
      console.error("🚨 Error sending message:", error.message);
    }
  };

  async function extractIntent(userQuery, bookNAME, keyword) {
    console.log("🤔 Gọi hàm extract");
    const prompt = `Hãy chỉ cho tôi biết ý định (intent) của câu hỏi sau thuộc trong nhóm các intent chính nào mà tôi đã phân loại \
(Tìm vị trí sách, Có sách này không?, Tìm sách theo tóm tắt, Thông tin sách, Kiểm tra phí phạt, Thông tin tài khoản, Lịch sử mượn sách) \
và tên sách (nếu có), bạn hãy kiểm tra xem tên của cuốn sách được nhập từ người dùng có viết chính xác không, nếu không chính xác thì hãy sửa lại cho đúng tên chuẩn.
Trả về kết quả dưới dạng JSON với định dạng (chỉ trả về đúng định dạng không thêm bất cứ gì cả):
  {
    "intent": "...",
    "bookName": "...",
    "keyword": "..."
  }
Chỉ trả về một từ hoặc cụm từ ngắn gọn (không kèm giải thích). Nếu input của người dùng không phù hợp với các intents đã phân loại sẵn ở trên thì trả về chuỗi là "KO".
Cuốn sách đã được đề cập: "${bookNAME}", chỉ sử dụng đến giá trị này khi người dùng đề cập tới cuốn sách trước đó mà họ không nói tên cuốn sách.
Câu hỏi: "${userQuery}"
Từ khóa: "${keyword}".`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "Bạn là trợ lý phân tích ý định và trích xuất thông tin sách.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 100,
            temperature: 0.2,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "💡 *Ket qua EXTRACT*: ",
        data.choices[0].message.content.trim()
      );
      const resultText = data.choices[0].message.content.trim();

      let result;
      try {
        result = JSON.parse(resultText);
      } catch (err) {
        console.error(
          "Lỗi khi parse JSON:",
          err,
          "Văn bản trả về:",
          resultText
        );
        result = null;
      }

      return result;
    } catch (error) {
      console.error("Lỗi khi trích xuất intent:", error);
      return null;
    }
  }

  const classifyFunctions = async (userInput) => {
    console.log("☀️☀️☀️ Gọi hàm classifyFunctions ☀️☀️☀️");
    let dataFromDatabase;
    const keys = await extractIntent(userInput, nameOfBook, "");

    if (keys === "KO" || keys.intent === "KO") {
      return "Không có dữ liệu phù hợp. Vui lòng đặt câu hỏi rõ ràng hơn.";
    }

    let finalBookName = nameOfBook;
    if (keys.bookName && keys.bookName !== "KO") {
      finalBookName = keys.bookName;
      await new Promise((resolve) => {
        setNameOfBook(keys.bookName);
        resolve();
      });
    } else {
      finalBookName = "";
    }

    // Cập nhật keyword mới: nếu keys.keyword hợp lệ thì lưu lại, ngược lại reset
    if (keys.keyword != "") {
      setKeyword(keys.keyword);
    } else {
      setKeyword("");
    }

    console.log("⭐ Fetch Data với:", keys.intent, finalBookName, keys.keyword);
    dataFromDatabase = await fetchData(
      keys.intent,
      finalBookName,
      keys.keyword
    );
    return dataFromDatabase;
  };

  async function fetchData(currentIntent, currentBookName, keyword) {
    let resData;
    if (currentIntent || currentBookName || keyword) {
      switch (currentIntent) {
        case "Tìm vị trí sách": {
          const result = await findBook(currentBookName);
          resData = result;
          console.log(`📘!@#SAU KHI FETCH SUPABASE: ${result}`);
          break;
        }
        case "Tìm sách theo tóm tắt": {
          resData = await findBooksByKeyword(keyword);
          console.log("📘!@#SAU KHI FETCH SUPABASE:", resData);
          break;
        }
        case "Có sách này không?": {
          const result = await hasBook(currentBookName);
          resData = result;
          console.log("!@#SAU KHI FETCH SUPABASE", result);
          break;
        }
        case "Thông tin sách": {
          const result = await bookIn4(currentBookName);
          resData = result;
          console.log("!@#SAU KHI FETCH SUPABASE", result);
          break;
        }
        case "Kiểm tra phí phạt": {
          const result = await checkFine(currentUserID);
          resData = result;
          console.log("!@#SAU KHI FETCH SUPABASE", result);
          break;
        }
        case "Thông tin tài khoản": {
          const result = await Account(currentUserID);
          resData = result;
          console.log("!@#SAU KHI FETCH SUPABASE", result);
          break;
        }
        case "Lịch sử mượn sách": {
          const result = await Chekouts(currentUserID);
          resData = result;
          console.log("!@#SAU KHI FETCH SUPABASE", result);
          break;
        }
        case "KO": {
          resData = `Không có dữ liệu`;
          console.log("!@#FETCH SUPABASE TRƯỜNG HỢP KO");
          break;
        }
        default:
          resData = `Không có dữ liệu`;
          console.log("!@#FETCH SUPABASE TRƯỜNG HỢP DEFAULT");
      }
      return resData;
    }
  }

  const runAssistant = async () => {
    if (!threadId) {
      console.error("❌ Thread ID not available");
      return;
    }

    console.log("🔄 Starting assistant run...");
    try {
      const response = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify({
            assistant_id: ASSISTANT_ID,
            model: FINE_TUNING,
          }), // 👈 Gửi ID của trợ lý
        }
      );

      const data = await response.json();
      console.log("✅ Assistant run started:", data);

      if (data?.id) {
        await checkRunStatus(data.id); // 👈 Kiểm tra xem phản hồi đã hoàn thành chưa
      } else {
        console.error(
          "❌ Error starting assistant run:",
          JSON.stringify(data, null, 2)
        );
      }
    } catch (error) {
      console.error("🚨 Error starting assistant run:", error.message);
    }
  };

  const checkRunStatus = async (runId) => {
    console.log("🔍 Checking run status...");

    try {
      let status = "in_progress";

      while (status === "queued" || status === "in_progress") {
        const response = await fetch(
          `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "OpenAI-Beta": "assistants=v2",
            },
          }
        );

        const data = await response.json();
        status = data.status;
        console.log(`ℹ️ Run status: ${status}`);

        if (status === "completed") {
          fetchAssistantReply();
          break;
        } else if (status === "failed") {
          console.error(
            "❌ Assistant run failed:",
            JSON.stringify(data, null, 2)
          );
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000)); // Đợi 2s trước khi kiểm tra tiếp
      }
    } catch (error) {
      console.error("🚨 Error checking run status:", error.message);
    }
  };

  const fetchAssistantReply = async () => {
    console.log("📨 Fetching assistant reply...");

    try {
      const response = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
        }
      );

      const reply = await response.json();

      // Dừng hiệu ứng suy nghĩ và xoá tin nhắn "thinking"
      setIsThinking(false);
      setMessages((prev) => prev.filter((m) => m.id !== "thinking"));

      if (reply?.data) {
        const assistantMessages = reply.data
          .filter((msg) => msg.role === "assistant")
          .map((msg) => ({
            id: uuidv4(),
            type: "assistant",
            text: msg.content[0].text.value,
          })); // 👈 Lấy nội dung đúng định dạng

        let chatbot = assistantMessages[0];
        console.log("🤖 Assistant replied:", chatbot);
        if (chatbot) {
          setMessages((prev) => [...prev, chatbot]);
        }
      } else {
        console.error(
          "❌ Error fetching messages:",
          JSON.stringify(reply, null, 2)
        );
      }
    } catch (error) {
      console.error("🚨 Error fetching assistant reply:", error.message);
    }
  };

  // Hiển thị từng tin nhắn với animation
  const renderItem = ({ item, index }) => {
    const isUser = item.type === "user";
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={600}
        delay={index * 100}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.botMessage,
        ]}
      >
        {!isUser && (
          <Image
            source={{
              uri: "https://img.icons8.com/emoji/48/000000/robot-emoji.png",
            }}
            style={styles.avatar}
          />
        )}
        <View style={[styles.messageBubble, isUser && styles.userBubble]}>
          <Text
            style={
              item.id === "thinking" ? styles.thinkingText : styles.messageText
            }
          >
            {item.text}
          </Text>
        </View>
        {isUser && <Image source={{ uri: avatarUri }} style={styles.avatar} />}
      </Animatable.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container]}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library Chatbot</Text>
        <TouchableOpacity
          onPress={() => setAccountMenuVisible(true)}
          style={styles.accountIcon}
        >
          <Image
            source={{ uri: avatarUri }} // Avatar của user
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={input}
          onChangeText={setInput}
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
      <AccountMenu
        visible={accountMenuVisible}
        onClose={() => setAccountMenuVisible(false)}
        userID = {userID}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DBDBDB",
    //backgroundColor: "#212121",
  },
  header: {
    backgroundColor: "#A08963",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    position: "relative",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingBottom: 100,
    top: 15,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  botMessage: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#C9B194",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "#C9B194",
    //backgroundColor: "#616161",
  },
  messageText: {
    fontSize: 16,
    color: "#1D1616",
    //color: "#fff",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 5,
  },
  inputContainer: {
    bottom: 5,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#DBDBDB",
    //backgroundColor: "#333",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    backgroundColor: "#C9B194",
    //backgroundColor: "#424242",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    //color: "#333",
    color: "#1D1616",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#A08963",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#1D1616",
    fontWeight: "bold",
  },
  thinkingText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  accountIcon: {
    position: "absolute",
    right: 10,
    top: "80%",
    transform: [{ translateY: -12 }],
  },
});

export default ChatScreen2;
