import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  try {
    const createdColumn = await columnModel.createNew(reqBody)

    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      // tạo mảng cards rỗng để FE xử lý
      getNewColumn.cards = []

      // cập nhật lại columnOrderIds trong Board
      await boardModel.pushColumnOrderIds(getNewColumn)

      return getNewColumn
    }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew
}
