import supabase from "./Supabase";

//Tìm vị trí sách
export const findBook = async (bookName) =>{
    const { data, error } = await supabase
            .from('Book')
            .select(`Title , Shelf(ShelfNumber,Side,Row, SubCategory(Category(CateName))) `)
            .eq('Title', bookName)

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
            .eq('Title', bookName)

        if (error) {
            console.log("Loi findBook")
        }
        if (data) {
            if(data[0].Title === bookName){
                return "Thư viện có cuốn sách bạn cần tìm"
            }else{
                return "Không có cuốn sách bạn cần tìm"
            }
        }
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
