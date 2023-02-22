import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import crypto from 'crypto'

import User from "../model/user.js";
import { createError } from "../utils/error.js";
import sendEmail from "../utils/email.js";
import user from "../model/user.js";

export const registerUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    User.findOne({ email }, async (err, user) => {
      if (err) return res.status(400);
      if (user) {
        return next(createError(400, { Message: "Email already in use" }));
      } else if (!user) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const data = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: email.toLowerCase(),
          password: hash,
        };
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return next(createError(400, { errors: errors.array() }));
        }
        const createUser = new User(data);

        const token = jwt.sign({ id: createUser._id }, process.env.JWT, {
          expiresIn: "3d",
        });

        createUser.token = token;
        createUser.loggedIn = true;

        const verifyUser = `${req.protocol}://${req.get(
          "host"
        )}/users/verifyuser/${createUser._id}`;

        const message = `Thank you for registering with us. Please click on this link ${verifyUser} to verify`;
        sendEmail({
          email: data.email,
          subject: "Kindly verify",
          message,
        });

        await createUser.save();

        return res.status(201).json({
          Message: "user created successfully!",
          data: createUser,
        });
      } else {
        return next();
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const userEmail = req.body.email.toLowerCase()
    const user = await User.findOne({ email: userEmail });
    if (!user) return next(createError(404, "User not found"));
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Incorrect username or password"));
    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "3d",
    });
    if (user.loggedIn === true)
    return next(createError(400, "Already signedIn in another device"));

    user.token = token;
    user.loggedIn = true;

    user.save()

    const { password, ...otherDetails } = user._doc;
    console.log("cookies ", user);

    res.status(200).json({
      message: "User found and loggedIn successfully!!",
      data: {
        ...otherDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  const user = await User.findById(req.params.Id);
  if (!user.token) {
    return next(createError(400, "Token Error"));
  }

  try {
    user.token = undefined;
    user.loggedIn = false;

    await user.save();
    res.json({ message: "Successfully logged out" });
  } catch (err) {
    next(err)
  }
};

export const logoutFromAllDevices = async (req, res, next) => {
  const userEmail = req.body.email
  const user = await User.findOne({email: userEmail.toLowerCase()});

  try {
    user.loggedIn = false;
    await user.save();
    res.status(200).json({ message: "Successfully logged-out from all devices" });
  } catch (err) {
    next(err)
  }
};

export const verify = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return next(createError(400, "No user Found"));
    await User.findByIdAndUpdate(
      user._id,
      {
        verify: true,
      },
      { new: true }
    );
    await user.save();

    res
      .redirect(`https://wazobia-nigeria.netlify.app/users/verifyuser/${user._id}`)
      .res.status(200)
      .json({
        message: "successfully verified",
      });
  } catch (error) {
    next(error);
  }
};

export const resendLink = async (req, res, next) => {
  try {
    const foundUser = await user.findOne({ _id: req.params.id });

    const verifyUser = `${req.protocol}://${req.get("host")}/users/verifyuser/${
      foundUser._id
    }`;
    const message = `Thank you for registering with us. Please click on this link ${verifyUser} to verify`;
    sendEmail({
      email: foundUser.email,
      subject: "Kindly verify",
      message,
    });
    return res.status(201).json({
      Message: "link sent successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const forgotpassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return next(createError(404, 'No user with that email'))
  const resetToken = user.createResetPassword()

  await user.save({ validateBeforeSave: false })
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/users/resetpassword/${resetToken}`

  try {
    const message = `Forgot your password? kindly click on this link: ${resetURL} to reset your password.
     \nIf you didnt make this request, simply ignore. Password expires in 10 minutes`
    sendEmail({
      email: user.email,
      subject: 'Your password reset token is valid for 10 mins',
      message,
    })
    res.status(200).json({
      status: 'success',
      message: 'Password Reset sent to email!',
    })
  } catch (err) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save({ validateBeforeSave: false })
    return next(
      createError(
        500,
        'There was an error sending email, please try again later',
      ),
    )
  }
}

export const getpasswordLink = async (req, res, next) => {
  const token = req.params.resetToken

  res
  .redirect(`https://wazobia-nigeria.netlify.app/users/resetpassword/${token}`)
  .status(200)
  .json({
    message: "Redirected to reset password",
  });
}

export const resetpassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex')
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  })
  if (!user) return next(createError(400, 'Token is invalid or expired'))
  const salt = bcrypt.genSaltSync(10)
  user.password = bcrypt.hashSync(req.body.password, salt)
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  user.token = undefined

  await user.save()
  res.status(200).json({
    status: 'successfully updated Password',
  })
}
