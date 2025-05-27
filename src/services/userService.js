import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

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
    const verificationLink = `
			${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}
		`
    console.log('verificationLink', verificationLink)
    const subject = 'Trello by MTHUYETDEV: Please verify your email before using our service!'
    const htmlContent = `
			<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
					<title>Email Verification</title>
					<style>
						body {
							font-family: Arial, sans-serif;
							background-color: #f4f6f8;
							padding: 20px;
							color: #333;
						}
						.email-container {
							max-width: 600px;
							margin: auto;
							background-color: #fff;
							border-radius: 10px;
							box-shadow: 0 0 10px rgba(0,0,0,0.1);
							padding: 30px;
						}
						.btn-verify {
							display: inline-block;
							margin-top: 20px;
							background-color: #0079bf;
							color: #fff;
							padding: 12px 20px;
							border-radius: 5px;
							text-decoration: none;
							font-weight: bold;
						}
						.footer {
							font-size: 12px;
							color: #777;
							margin-top: 30px;
						}
					</style>
				</head>
				<body>
					<div class="email-container">
						<h2>Verify Your Email Address</h2>
						<p>Hi there,</p>
						<p>Thank you for signing up for <strong>Trello by MTHUYETDEV</strong>. Before you can start using our service, we need to verify your email address.</p>
						<p>Please click the button below to verify your email:</p>
						<a href="${verificationLink}" class="btn-verify">Verify Email</a>
						<p>If the button doesn’t work, copy and paste the following link into your browser:</p>
						<p><a href="${verificationLink}">${verificationLink}</a></p>
						<p class="footer">If you didn’t create an account with us, you can safely ignore this email.</p>
					</div>
				</body>
				</html>
		`
    // await BrevoProvider.sendEmail(getNewUser.email, getNewUser.displayName, subject, htmlContent)

    // trả về dữ liệu cho controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active')
    if (existUser.verifyToken !== reqBody.token) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid token')

    // update isActive & verifyToken
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    const updatedUser = await userModel.update(existUser._id, updateData)

    // return user after updated
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Wrong email or password')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password))
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Wrong email or password')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active, please verify your email!')

    // tạo token đăng nhập để trả về cho client
    const userInfo = { _id: existUser._id, email: existUser.email }

    // tạo ra 2 loại token: accessToken và refreshToken
    const accessToken = await JwtProvider.genegrateToken(userInfo, env.ACCESS_TOKEN_SIGNATURE, env.ACCESS_TOKEN_LIFE)
    const refreshToken = await JwtProvider.genegrateToken(userInfo, env.REFRESH_TOKEN_SIGNATURE, env.REFRESH_TOKEN_LIFE)

    // trả về thông tin của user kèm 2 token vừa tạo
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login
}
