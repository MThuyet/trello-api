import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  try {
    const createdColumn = await columnModel.createNew(reqBody)

    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    return getNewColumn
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew
}
