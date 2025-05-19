import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'

// Define Collection (Name & Schema)

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(255).trim().strict(),
  type: Joi.string()
    .valid(...Object.values(BOARD_TYPES))
    .required(),

  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// tạo mới
const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
  } catch (error) {
    throw new Error(error)
  }
}

// tìm kiếm theo id
const findOneById = async (id) => {
  try {
    const objectId = new ObjectId(String(id))
    return await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: objectId })
  } catch (error) {
    throw new Error(error)
  }
}

// query tổng hợp để lấy toàn bộ Columns và Cards thuộc về Board
const getDetails = async (id) => {
  try {
    const objectId = new ObjectId(String(id))
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        // tìm Board theo id tương tự như findOne
        {
          $match: {
            _id: objectId,
            _destroy: false // chỉ lấy các bản ghi không bị xóa
          }
        },
        // tìm đến Collection Columns ( tương tự JOIN trong SQL )
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME, // xác định collection cần kết nối
            localField: '_id', // trường trong bảng Board dùng để kết nối
            foreignField: 'boardId', // tìm các column thuộc về Board ( tương tự khóa ngoại )
            as: 'columns' // đặt tên cho mảng kết quả
          }
        },
        // Cards
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME, // xác định collection cần kết nối
            localField: '_id', // trường trong bảng Board dùng để kết nối
            foreignField: 'boardId', // tìm các card thuộc về Board ( tương tự khóa ngoại )
            as: 'cards' // đặt tên cho mảng kết quả
          }
        }
      ])
      .toArray() // chuyển kết quả thành mảng vì arregate luôn trả về một cursor đến một tập kết quả, chứ không trả về một document trực tiếp, dù cursor đó có chứa một phần tử hay nhiều phần tử

    // dữ liệu luôn là mảng có một phần tử vì id là duy nhất
    return result[0] || {} // trả về phần tử đầu tiên hoặc mặc định là {}
  } catch (error) {
    throw new Error(error)
  }
}

// push columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        // tìm board theo id
        { _id: new ObjectId(String(column.boardId)) },
        // push columnId vào cuối mảng columnOrderIds
        { $push: { columnOrderIds: new ObjectId(String(column._id)) } },
        // trả về document sau khi cập nhật
        { returnDocument: 'after' }
      )

    // hàm này không trả về trực tiếp document mà trả về một object có thuộc tính value chứa document
    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds
}
