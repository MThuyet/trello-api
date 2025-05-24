import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'

const createNew = async (reqBody) => {
  try {
    // kiểm tra xem email đã tồn tại hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')

    // tách chuỗi email thành mảng gồm 2 phần tử: phần trước @ và phần sau @
    const nameFromEmail = reqBody.email.split('@')[0]

    // tạo data
    const newUser = {
      email: reqBody.email,
      // tham số thứ 2 là độ phức tạp, giá trị càng cao thì băm càng lâu
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      // khi đăng kí mới mặc định để giống username và sau này update
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // thực hiện lưu vào database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // gửi email xác thực tài khoản

    // trả về dữ liệu cho controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew
}
