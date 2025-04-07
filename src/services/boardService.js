import { slugify } from '~/utils/formatters'

/* eslint-disable no-useless-catch */
const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới model để xử lý vào DB

    // Xử lý thêm các logic khác nếu đặc thù dự án cần

    // Trả kết quả về, lưu ý trong Service luôn phải có return
    return newBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}
