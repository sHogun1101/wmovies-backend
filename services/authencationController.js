require("dotenv").config();
const jwt = require("jsonwebtoken");
const graphql = require("./graphQLSendRequest");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const loginUserWithGoogle = async function (req, res) {
  if (
    req.body &&
    req.body.dataCheck &&
    req.body.dataCheck.google_id &&
    req.body.dataCheck.token
  ) {
    const body = {
      query: `
        query MyQuery {
          users(where:{ google_id: {_eq:"${req.body.dataCheck.google_id}"}, token_login: {_eq: "${req.body.dataCheck.token}"} } ){
              id
              username
              email
              image_user        
          }
        }
                            `,
      variables: {},
    };
    const resQuery = await graphql.send(body);
    if (
      resQuery &&
      resQuery.data &&
      resQuery.data.data &&
      resQuery.data.data.users &&
      resQuery.data.data.users.length > 0
    ) {
      const user = resQuery.data.data.users[0];
      const { password, ...dataSend } = user;
      const newToken = uuidv4();
      const token = jwt.sign(dataSend, process.env.JWT_SECRET_KEY);
      const dataResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        image_user: user.image_user,
        token: token,
      };
      const bodyUpdate = {
        query: `
          mutation MyMutation {
            update_users(
            where: {id: {_eq: "${user.id}"}}
            _set: {
                token_login: "${newToken}"
            }) {
              affected_rows
            }
          }
        `,
        variables: {},
      };
      const resUpdate = await graphql.send(bodyUpdate);

      res.send({
        status: true,
        data: dataResponse,
        message: "Đăng nhập thành công",
      });
    } else {
      res.send({
        status: false,
        data: null,
        message: "Truy cập không hợp lệ",
      });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
const loginUser = async function (req, res) {
  if (req.body && req.body.data_login) {
    const body = {
      query: `
              query MyQuery {
                  users(where:{ email: {_eq:"${req.body.data_login.email}"}, is_delete: {_eq: false} } ){
                      id
                      username
                      email
                      password
                  }
              }
                    `,
      variables: {},
    };
    const resQuery = await graphql.send(body);
    if (
      resQuery &&
      resQuery.data &&
      resQuery.data.data &&
      resQuery.data.data.users &&
      resQuery.data.data.users.length > 0
    ) {
      const user = resQuery.data.data.users[0];
      const passwordUser = user.password;
      if (bcrypt.compareSync(req.body.data_login.password, passwordUser)) {
        const { password, ...data } = user;
        const token = jwt.sign(data, process.env.JWT_SECRET_KEY);
        const dataResponse = {
          id: user.id,
          username: user.username,
          email: user.email,
          token: token,
        };
        // res.cookie("jwt-login", token, {
        //   httpOnly: true,
        //   maxAge: 24 * 60 * 60 * 100,
        //   sameSite: "Strict", // works for local development
        // });
        res.send({
          status: true,
          data: dataResponse,
          message: "Đăng nhập thành công",
        });
      } else {
        res.send({
          status: false,
          data: null,
          message: "Mật khẩu đăng nhập không đúng",
        });
      }
    } else {
      res.send({ status: false, data: null, message: "Email không tồn tại" });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
const getUser = async function (req, res) {
  try {
    const cookie = req.cookies["jwt-login"];
    const claimTokien = cookie
      ? jwt.verify(cookie, process.env.JWT_SECRET_KEY)
      : null;
    if (!claimTokien) {
      return res.send({
        status: false,
        data: null,
        message: "Hết thời gian truy cập. Vui lòng đăng nhập lại",
      });
    }
    const body = {
      query: `
            query MyQuery {
                users(where:{ id: {_eq:"${claimTokien.id}"}, is_delete: {_eq: false} } ){
                    id
                    username
                    email
                    image_user
                    password
                }
            }
                  `,
      variables: {},
    };
    const resQuery = await graphql.send(body);
    if (
      resQuery &&
      resQuery.data &&
      resQuery.data.data &&
      resQuery.data.data.users &&
      resQuery.data.data.users.length > 0
    ) {
      const user = resQuery.data.data.users[0];
      const { password, ...dataSend } = user;
      res.send({
        status: true,
        message: "Lấy dữ liệu thành công",
        data: dataSend,
      });
    } else {
      res.send({
        status: false,
        message: "Không tìm thấy tài khoản. Vui lòng đăng nhập lại",
        data: null,
      });
    }
  } catch (error) {
    return res.send({
      status: false,
      data: null,
      message: "Hết thời gian truy cập. Vui lòng đăng nhập lại",
    });
  }
};
const updateInfoUser = async function (req, res) {
  if (req.body && req.body.data_update && req.body.data_update.id) {
    const body = {
      query: `
                  query MyQuery {
                      users(where:{ 
                      id: {_eq:"${req.body.data_update.id}"}, 
                      is_delete: {_eq: false} } ){
                          id
                          username
                          email
                          password
                      }
                  }
                        `,
      variables: {},
    };
    const resQuery = await graphql.send(body);

    if (
      resQuery &&
      resQuery.data &&
      resQuery.data.data &&
      resQuery.data.data.users &&
      resQuery.data.data.users.length > 0
    ) {
      const user = resQuery.data.data.users[0];
      // Đổi mật khẩu
      if (req.body.data_update.oldPassword) {
        // Mật khẩu cũ đúng tiến hành update
        if (
          bcrypt.compareSync(req.body.data_update.oldPassword, user.password)
        ) {
          const saltRounds = 10;
          let hash = null;
          if (req.body.data_update.newPassword) {
            hash = bcrypt.hashSync(
              req.body.data_update.newPassword,
              saltRounds
            );
          }

          const bodyUpdate = {
            query: `
                   mutation MyMutation {
                              update_users(
                               where: {id: {_eq: "${req.body.data_update.id}"}}
                               _set: {
                                  username: "${req.body.data_update.username}"
                                  ${hash ? `password: "${hash}"` : ""}
                               }
                                ) {
                                affected_rows
                               
                              }
          }
                            `,
            variables: {},
          };
          const resUpdate = await graphql.send(body);
          if (
            resUpdate &&
            resUpdate.data &&
            resUpdate.data.data &&
            resUpdate.data.data.update_users &&
            resUpdate.data.data.update_users.affected_rows
          ) {
            res.send({
              data: "update_password_success",
              status: true,
              message: "Cập nhật mật khẩu thành công. Vui lòng đăng nhập lại ",
            });
          } else {
            console.log(resUpdate.data.errors);
            res.send({
              status: false,
              data: null,
              message: "Cập nhật thông tin tài khoản thất bại",
            });
          }
        } else {
          res.send({
            status: false,
            data: "incorret_old_password",
            message: "Mật khẩu cũ không đúng",
          });
        }
      }
      // Không đổi update tên người dùng
      else {
        const bodyUpdate = {
          query: `
          mutation MyMutation {
                              update_users(
                               where: {id: {_eq: "${req.body.data_update.id}"}}
                               _set: {
                                  username: "${req.body.data_update.username}"
                                
                               }
                                ) {
                                affected_rows
                               
                              }
          }
                            `,
          variables: {},
        };
        const resUpdate = await graphql.send(body);

        if (
          resUpdate &&
          resUpdate.data &&
          resUpdate.data.data &&
          resUpdate.data.data.update_users &&
          resUpdate.data.data.update_users.affected_rows
        ) {
          res.send({
            data: resUpdate.data.data.update_users.affected_rows,
            status: true,
            message: "Cập nhật tên người dùng thành công",
          });
        } else {
          console.log(resUpdate.data.errors);
          res.send({
            status: false,
            data: null,
            message: "Cập nhật tên người dùng thất bại",
          });
        }
      }
    } else {
      res.send({
        status: false,
        message: "Không tìm thấy tài khoản. Vui lòng đăng nhập lại",
        data: null,
      });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
const loginAdmin = async function (req, res) {
  if (req.body && req.body.data_login) {
    const body = {
      query: `
                query MyQuery {
                  users(where:{ email: {_eq:"${req.body.data_login.email}"}, is_delete: {_eq: false} } ){
                      id
                      username
                      email
                      password
                  }
                  admins(where:{ email: {_eq:"${req.body.data_login.email}"}, is_delete: {_eq: false} } ){
                        id
                        username
                        email
                        password
                  }
                }
                      `,
      variables: {},
    };
    const resQuery = await graphql.send(body);

    if (
      resQuery &&
      resQuery.data &&
      resQuery.data.data &&
      resQuery.data.data.users &&
      resQuery.data.data.users.length > 0
    ) {
      const user = resQuery.data.data.users[0];
      const passwordUser = user.password;
      if (bcrypt.compareSync(req.body.data_login.password, passwordUser)) {
        return res.send({
          status: false,
          data: "is_guest",
          message: "Bạn không có quyền truy cập vào trang admin",
        });
      }
    }
    if (
      resQuery &&
      resQuery.data &&
      resQuery.data.data &&
      resQuery.data.data.admins &&
      resQuery.data.data.admins.length > 0
    ) {
      const user = resQuery.data.data.admins[0];
      const passwordUser = user.password;
      if (bcrypt.compareSync(req.body.data_login.password, passwordUser)) {
        const { password, ...data } = user;
        const token = jwt.sign(data, process.env.JWT_SECRET_KEY);
        const dataResponse = {
          id: user.id,
          username: user.username,
          email: user.email,
          token: token,
        };
        // res.cookie("jwt-login", token, {
        //   httpOnly: true,
        //   maxAge: 24 * 60 * 60 * 100,
        //   sameSite: "Strict", // works for local development
        // });
        res.send({
          status: true,
          data: dataResponse,
          message: "Đăng nhập thành công",
        });
      } else {
        res.send({
          status: false,
          data: null,
          message: "Mật khẩu đăng nhập không đúng",
        });
      }
    } else {
      res.send({
        status: false,
        data: null,
        message: "Email đăng nhập không tồn tại",
      });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
const getAdmin = async function (req, res) {
  try {
    const cookie = req.cookies["jwt-login-admin"];
    const claimTokien = cookie
      ? jwt.verify(cookie, process.env.JWT_SECRET_KEY)
      : null;
    if (!claimTokien) {
      return res.send({
        status: false,
        data: null,
        message: "Hết thời gian truy cập. Vui lòng đăng nhập lại",
      });
    }
    const body = {
      query: `
              query MyQuery {
                  admins(where:{ id: {_eq:"${claimTokien.id}"}, is_delete: {_eq: false} } ){
                      id
                      username
                      email
                      password
                  }
              }
                    `,
      variables: {},
    };
    const resQuery = await graphql.send(body);
    if (
      resQuery &&
      resQuery.data &&
      resQuery.data.data &&
      resQuery.data.data.admins &&
      resQuery.data.data.admins.length > 0
    ) {
      const user = resQuery.data.data.admins[0];
      const { password, ...dataSend } = user;
      res.send({
        status: true,
        message: "Lấy dữ liệu thành công",
        data: dataSend,
      });
    } else {
      res.send({
        status: false,
        message: "Không tìm thấy tài khoản. Vui lòng đăng nhập lại",
        data: null,
      });
    }
  } catch (error) {
    return res.send({
      status: false,
      data: null,
      message: "Hết thời gian truy cập. Vui lòng đăng nhập lại",
    });
  }
};
const updateInfoAdmin = async function (req, res) {
  if (req.body && req.body.data_update && req.body.data_update.id) {
    const body = {
      query: `
                    query MyQuery {
                        admins(where:{ 
                        id: {_eq:"${req.body.data_update.id}"}, 
                        is_delete: {_eq: false} } ){
                            id
                            username
                            email
                            password
                        }
                    }
                          `,
      variables: {},
    };
    const resQuery = await graphql.send(body);

    if (
      resQuery &&
      resQuery.data &&
      resQuery.data.data &&
      resQuery.data.data.admins &&
      resQuery.data.data.admins.length > 0
    ) {
      const user = resQuery.data.data.admins[0];
      // Đổi mật khẩu
      if (req.body.data_update.oldPassword) {
        // Mật khẩu cũ đúng tiến hành update
        if (
          bcrypt.compareSync(req.body.data_update.oldPassword, user.password)
        ) {
          const saltRounds = 10;
          let hash = null;
          if (req.body.data_update.newPassword) {
            hash = bcrypt.hashSync(
              req.body.data_update.newPassword,
              saltRounds
            );
          }

          const bodyUpdate = {
            query: `
                     mutation MyMutation {
                                update_admins(
                                 where: {id: {_eq: "${
                                   req.body.data_update.id
                                 }"}}
                                 _set: {
                                   
                                    ${hash ? `password: "${hash}"` : ""}
                                 }
                                  ) {
                                  affected_rows
                                 
                                }
            }
                              `,
            variables: {},
          };
          const resUpdate = await graphql.send(body);

          if (
            resUpdate &&
            resUpdate.data &&
            resUpdate.data.data &&
            resUpdate.data.data.update_admins &&
            resUpdate.data.data.update_admins.affected_rows
          ) {
            res.send({
              data: "update_password_success",
              status: true,
              message: "Cập nhật mật khẩu thành công. Vui lòng đăng nhập lại ",
            });
          } else {
            console.log(resUpdate.data.errors);
            res.send({
              status: false,
              data: null,
              message: "Cập nhật mật khẩu thất bại",
            });
          }
        } else {
          res.send({
            status: false,
            data: "incorret_old_password",
            message: "Mật khẩu cũ không đúng",
          });
        }
      }
    } else {
      res.send({
        status: false,
        message: "Không tìm thấy tài khoản. Vui lòng đăng nhập lại",
        data: null,
      });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
module.exports = {
  loginUserWithGoogle,
  loginUser,
  loginAdmin,
  getUser,
  getAdmin,
  updateInfoUser,
  updateInfoAdmin,
};
