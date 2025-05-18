import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

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

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)

    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

    // biến đổi dữ liệu phù hợp với FE
    const resBoard = cloneDeep(board)
    // đưa card về đúng column của nó
    resBoard.columns.forEach((column) => {
      // id hiện đang có kiểu dữ liệu là objectId nên phải chuyển về string để so sánh
      column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString())

      // cách dùng .equals() này vì objectId trong MG có support .equals()
      // column.cards = resBoard.cards.filter((card) => card.columnId.equals(column._id))
    })

    // xóa mảng cards khỏi Boards
    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails
}
