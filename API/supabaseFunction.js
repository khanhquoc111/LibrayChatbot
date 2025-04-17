import supabase from "./Supabase";


export const getUserThreadID = async (email) => {
    const {data, error} = await supabase
        .from('User')
        .select('ThreadID')
        .eq('Email', email)
        .single();
    
    if(error){
        console.error('Loi khi lay ThreadID:', error.message);
        return null;
    }
    return data ? data.ThreadID : null;
}


export const insertMessage = async (threadId, role, text) => {
    const {data, error} = await supabase
        .from('Message')
        .insert([
            {ThreadID: threadId, Role: role, Text: text}
        ]);
    
    if(error) {
        console.error('Loi chen message: ', error.message);
        return null;
    } else {
        //console.log('Message duoc them: ', data);
        return data;
    }
}

export const getMessages = async (threadID) => {
    const { data, error } = await supabase
      .from('Message')
      .select('*')
      .eq('ThreadID', threadID)
      .order('Created_at', { ascending: true });
    
    if (error) {
      console.error("Loi khi hien thi messages:", error.message);
      return [];
    }
    return data;
  };
  

//Tìm vị trí sách
export const findBook = async (bookName) =>{
    const { data, error } = await supabase
            .from('Book')
            .select(`Title , Shelf(ShelfNumber,Side,Row, SubCategory(Category(CateName))) `)
            .ilike('Title', bookName)

        if (error) {
            console.log("Loi findBook")
        }
        if (data) {
            console.log('Fetching successfully')
            return JSON.stringify(data) 
        }
}

//Có sách này không ?
export const hasBook = async (bookName) =>{
    const { data, error } = await supabase
            .from('Book')
            .select(`Title`)
            .ilike('Title', bookName)

        if (error) {
            console.log("Loi hasBook")
        }
        if (!data || data.length === 0) {
            return "Không có cuốn sách bạn cần tìm";
          }
        
          // Nếu có ít nhất 1 record, ta coi như "có sách"
          return "Thư viện có cuốn sách bạn cần tìm";
}

//Thông tin sách
export const bookIn4 = async (bookName) => {
    try {
      const { data: bookData, error: bookError } = await supabase
        .from('Book') 
        .select('BookID') 
        .eq('Title', bookName) 
        .single()
  
      if (bookError || !bookData) {
        console.log("Lỗi tìm BookID:", bookError?.message || "Không tìm thấy sách")
        return;
      }
  
      const { BookID } = bookData

      const { data: copyData, error: copyError } = await supabase
        .from('Book_Copy') 
        .select('Quantity, Book(ISBN, Title, Author, Publisher)') 
        .eq('BookID', BookID);
  
      if (copyError) {
        console.log("Lỗi bookIn4:", copyError.message)
      } else {
        console.log('Fetching successfully:')
        return JSON.stringify(copyData)
      }
    } catch (err) {
      console.error("Lỗi ngoài mong đợi:", err)
    }
  }

//Kiểm tra phí phạt
export const checkFine = async (userID) =>{
    const { data, error } = await supabase
            .from('Fine')
            .select('IsPaid, FineAmount, FineDate')
            .eq('UserID', userID)
            .single()

        if (error) {
            console.log("Loi checkFine")
        }

        if (data) {
            if(data.IsPaid === false){
                return 'Bạn không bị phạt'
            }else{
                return `Bạn bị phạt. Phí phạt: ${data.FineAmount}, ngày phạt: ${data.FineDate}.`
            }
        }
}

//Thông tin tài khoản 
export const Account = async (UserID) =>{
    const { data, error } = await supabase
            .from('User')
            .select('FullName, JoinDate, Email')
            .eq('UserID', UserID)
            .single()

        if (error) {
            console.log("Loi Account")
        }
        if (data) {
            let acc = JSON.stringify(data)
            let check = await Chekouts(UserID)
            let fine = await checkFine(UserID)

            return `Thông tin tài khoản: ${acc} \n Lịch sử mượn sách: ${check} \n Thông tin phạt: ${fine}`
        }
}

//Lịch sử mượn sách
export const Chekouts = async (UserID) =>{
    const { data, error } = await supabase
            .from('Checkouts')
            .select('CheckoutDate, ReturnDate, Book_Copy(Book(Title))')
            .eq('UserID', UserID)

        if (error) {
            console.log("Loi Checkouts")
        }
        if (data) {
            return JSON.stringify(data) 
        }
}

//Lấy Avatar dựa theo UserID
export async function getUserInfo(userId) {
    try {
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("UserID", userId)
        .single();
  
      if (error) {
        throw error;
      }
  
      return data;
    } catch (error) {
      console.error("Error fetching user info:", error.message);
      return null;
    }
  }

export const findBooksByKeyword = async(keyword) => {
    const {data, error} = await supabase
        .from('Book')
        .select('Title, Author')
        .ilike('Summary', `%${keyword}%`);
    if(error){
        console.error('Loi findbookkeyword: ', error);
        return [];
    }
    return data;
}

export const updatePassword = async (userID, oldPassword, newPassword) => {
  try {
    const { data: userData, error: fetchError } = await supabase
      .from('User')
      .select('UserID, Password')
      .eq('UserID', userID)
      .single();

    if (fetchError) {
      console.error('Lỗi khi truy xuất người dùng:', fetchError);
      return { error: fetchError.message };
    }
    if (!userData) {
      return { error: 'User không tồn tại' };
    }

    // Bước 2: So sánh mật khẩu cũ
    if (userData.Password !== oldPassword) {
      return { error: 'Mật khẩu cũ không chính xác' };
    }

    // Bước 3: Cập nhật mật khẩu mới
    const { data: updateData, error: updateError } = await supabase
      .from('User')
      .update({ Password: newPassword })
      .eq('UserID', userID);

    if (updateError) {
      console.error('Lỗi khi cập nhật mật khẩu:', updateError);
      return { error: updateError.message };
    }

    return { data: updateData };
  } catch (error) {
    console.error('Lỗi updatePassword:', error);
    return { error: error.message };
  }
};


  // Hàm lưu tin nhắn lên Supabase
 export const saveMessageToSupabase = async (threadId, sender, message) => {
    const { error } = await supabase.from("Chat_History").insert([
      {
        ThreadID: threadId,
        Role: sender,
        Text: message,
        Created_at: new Date(),
      },
    ]);
    if (error) {
      console.error("Lỗi lưu tin nhắn:", error);
    } else {
      console.log(" 🎀 Tin nhắn đã được lưu thành công");
    }
  };

  // Hàm load lịch sử chat từ Supabase
 export const loadChatHistory = async (threadId) => {
    const { data, error } = await supabase
      .from("Chat_History")
      .select("*")
      .eq("ThreadID", threadId)
      .order("Created_at", { ascending: true });
    if (error) {
      console.error("Lỗi load lịch sử chat:", error);
      return [];
    }
    return data;
  };
