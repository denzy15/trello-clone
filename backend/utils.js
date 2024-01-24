import jwt from "jsonwebtoken";
("jsonwebtoken");

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Invalid Token" });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

export const convertUsersResponse = (userData) => {
  if (Array.isArray(userData)) {
    return userData.map((user) => {
      const { username, email, _id } = user;
      return { _id, username, email };
    });
  }

  const { username, email, _id } = userData;
  return { _id, username, email };
};
