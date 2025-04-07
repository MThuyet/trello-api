import { StatusCodes } from 'http-status-codes'

const createNew = (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service

    // Có kết quả trả về phía client
    res.status(StatusCodes.CREATED).json({ message: 'POST from Controller: API create new board' })
  } catch (error) {
    // Khi gọi next, express sẽ đưa về nơi xử lý lỗi tập trung
    next(error)
  }
}

export const boardController = {
  createNew
}
