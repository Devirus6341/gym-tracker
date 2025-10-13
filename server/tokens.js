import jwt from 'jsonwebtoken';

const createAccessToken = (userId) => {
   return jwt.sign({userId}, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: '15m'
    })
};

const createRefreshToken = (userId) => {
  return  jwt.sign({userId}, process.env.REFRESH_TOKEN_KEY, {
        expiresIn: '7d'
    })
};

const sendRefreshToken = (res,refreshToken) => {
  res.cookie("refreshtoken", refreshToken, {
  httpOnly: true,
  secure: false,
  path: "/refresh_token",
});
}

export {createAccessToken, createRefreshToken, sendRefreshToken}