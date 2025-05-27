import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    // xử lý trả về httpOnly cookie cho trình duyệt
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true, // Chỉ cho phép cookie được truy cập bởi HTTP request, không thể truy cập qua JavaScript (ngăn XSS).
      secure: true, // Chỉ gửi cookie khi kết nối là HTTPS
      sameSite: 'none', // 	Cho phép truy cập từ các domain khác (cross-site) — ví dụ như frontend và backend chạy trên 2 domain khác nhau.
      maxAge: ms('14d') // thư viện tự convert sang milisecond
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14d')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login
}
