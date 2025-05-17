import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'

/* eslint-disable no-useless-catch */
const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới model để xử lý vào DB
    const createdBoard = await boardModel.createNew(newBoard)

    // Xử lý thêm các logic khác nếu đặc thù dự án cần
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Trả kết quả về, lưu ý trong Service luôn phải có return
    return getNewBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}
