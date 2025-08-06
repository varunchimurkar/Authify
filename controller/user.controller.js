import User from "../model/User.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const registerUser = async (req, res) => {

  //get data
  //validate
  //check if user already exists
  //create a user in database
  //create a verification token
  //save token in database
  //send token as email to user
  //send success status to user

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    })
  }

  try {
    const existinguser = await User.findOne({ email })

    if (existinguser) {
      return res.return(400).json({
        message: "User already exists"
      })
    }

    const user = await User.create({
      name,
      email,
      password
    })

    console.log(user)

    if (!user) {
      return res.return(400).json({
        message: "User not registered"
      })
    }

    const token = crypto.randomBytes(32).toString("hex")
    console.log(token)

    user.verificationToken = token

    await user.save()

    //send email 

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    })

    const mailOption = {

      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Verify your email",
      text: `Please click on the following link: 
    ${process.env.BASE_URL}/api/v1/users/verify/${token}`,

    }
    await transporter.sendMail(mailOption)

    res.status(201).json({
      message: "User registered successfuly",
      success: true
    })

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(400).json({
      message: "User not registered",
      error,
      success: false
    })
  }


}

const verifyUser = async (req, res) => {
  //get token from url
  //validate
  //find user based on token
  //if not
  //set isverified field to true
  //remove verification token
  //return respose

  const { token } = req.params
  console.log(token)

  if (!token) {
    return res.status(400).json({
      message: "Invalid token"
    })
  }

  try {
    const user = await User.findOne({
      verificationToken: token
    })

    if (!user) {
      return res.status(400).json({
        message: "Invalid token"
      })
    }

    user.isVerified = true
    user.verificationToken = undefined
    await user.save()


    res.status(200).json({
      message: "User verified successfully",
      success: true,
    });
  }
  catch (error) {
    res.status(400).json({
      message: "User not verified",
      error,
      success: false,
    });
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    })
  }

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      })
    }
    const isMatch = await bcrypt.compare(password, user.password)

    console.log(isMatch)

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      })
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in"
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role },
      process.env.JWT_SECRET,

      {
        expiresIn: "24h"
      }
    )

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
    }

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
      success: true,
      message: "Login Successfull",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }

    })

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
}

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }

    res.status(200).json({
      success: true,
      user
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }

}

const logout = (req, res) => {
  try {
    res.cookie('token', '', {})
    res.status(200).json({
      success: true,
      message: "Logged out successsfully"
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
}

const forgetPassword = async (req, res) => {

  // get email
  // find user based on email
  // reset token + reset expiry => Date.now() + 10 * 60 * 1000 => user.save()
  // send mail => design url

  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      message: "Email fields are required"
    })
  }

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: "user not found"
      })
    }

    const resettoken = crypto.randomBytes(32).toString("hex")
    user.resetPasswordToken = resettoken
    user.resetPasswordExpires = Date.now() + 1 * 60 * 1000

     
    await user.save()

    console.log(resettoken);

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    })

    const mailOption = {

      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Forget your Password",
      text: `Please click on the following link: 
      ${process.env.BASE_URL}/api/v1/users/resetPassword/${resettoken}`,

      //${process.env.BASE_URL}/api/v1/users/forgetPassword/${resettoken}

    }
    await transporter.sendMail(mailOption)

    res.status(201).json({
      message: "Forget Password email sent",
      success: true
    })

  } catch (error) {

    res.status(400).json({
      message: "User not registered",
      error,
      success: false
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    //collect token from params
    //password from req.body
    const { token } = req.params;
    const { password, confPassword } = req.body;

    if (!password || !confPassword) {
      return res.status(400).json({
        message: "Both password fields are required"
      })
    }

    if (password !== confPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      })
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }
    // set password in user
    user.password = password

    // resetToken, resetExpiry => reset

    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    // save

    await user.save()

    res.status(200).json({
      message: "Password has been reset successfully"
    })

  } catch (error) {

    res.status(400).json({
      message: "Reset Password Error",
      error,
      success: false
    })
  }
}

export { registerUser, verifyUser, login, getMe, forgetPassword, logout, resetPassword }