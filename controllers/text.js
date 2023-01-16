import Text from '../model/text.js'
import user from '../model/user.js'

export const createText = async (req, res, next) => {
  const userId = req.params.Id
  const { name, description } = req.body
  try {
    const savedText = await Text.create({
      name,
      description,
    })
    try {
      await user.findByIdAndUpdate(userId, {
        $push: { text: savedText._id },
      })
    } catch (error) {
      next(error)
    }
    return res.status(201).json({
      message: 'Text created successfully',
      data: {
        savedText,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const updateText = async (req, res, next) => {
  try {
    const updatedText = await Text.findByIdAndUpdate(req.params.textId, req.body, {
      new: true,
    })
    return res.status(200).json({
      message: 'Successful',
      data: {
        updatedText,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getAllText = async (req, res, next) => {
  try {
    const texts = await Text.find()
  const userlId = req.params.Id
  const userTexts = await user.findById(userlId);

  let gottenText = [];
  texts.map((text) => {
    userTexts.text.map((userText) => {
      if(text._id.toString() === userText) {
        gottenText.push(text)
      }
    })
  })
  const UserText = gottenText.filter(
    (value, index, self) =>
    index === self.findIndex((t) => t.name === value.name)
    );
    console.log(UserText)
    return res.status(200).json({
      message: 'Successful',
      data: {
        UserText,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteText = async (req, res, next) => {
  const userID = req.params.Id
  try {
    try {
      await user.findByIdAndUpdate(userID, {
        $pull: { text: req.params.textId },
      })
    } catch (error) {
      next(error)
    }
    await Text.findByIdAndDelete(req.params.textId)
    res.status(200).json({
      message: 'Successfully deleted Text!!',
    })
  } catch (error) {
    next(error)
  }
}
