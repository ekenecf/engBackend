import User from '../model/user.js'

export const getOneUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.Id)
    const { password, ...otherDetails } = user._doc

    res.status(200).json({
      message: 'Successful',
      data: {
        ...otherDetails,
      },
    })  
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.Id)
    res.status(200).json({
      message: 'Successfully deleted user!!',
    })
  } catch (error) {
    next(error)
  }
}
