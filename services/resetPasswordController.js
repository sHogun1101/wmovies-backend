require("dotenv").config();
const graphql = require("./graphQLSendRequest");
const Mailjet = require("node-mailjet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMailUser = async function (req, res) {
  if (req.body && req.body.emailUser) {
    const body = {
      query: `
                    query MyQuery {
                        users(where:{ email: {_eq:"${req.body.emailUser}"}, is_delete: {_eq: false} } ){
                            id
                            username
                            email
                           
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
      const token = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "15m",
        }
      );
      const resetLink = `${process.env.URL_CLIENT}/user/reset_password?email=${user.email}&token=${token} `;
      const mailjet = Mailjet.apiConnect(
        process.env.MJ_APIKEY_PUBLIC,
        process.env.MJ_APIKEY_PRIVATE
      );

      const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "huyhoanglove10@gmail.com",
              Name: "WMovies Support",
            },
            To: [
              {
                Email: user.email,
                Name: user.username,
              },
            ],
            Subject: "Reset mật khẩu WMovies",

            HTMLPart: `
                <p>Xin chào ${user.username},</p>
                <p>Chúng tôi vừa nhận được yêu cầu reset mật khẩu từ tài khoản ${user.username} của bạn trên <a href="http//:locahost:3000">wmovies.tech</a></p>
                <p>Vui lòng click vào đường dẫn để tiến hành reset mật khẩu: <a href="${resetLink}">Reset mật khẩu</a></p>
                <p>Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này hoặc phản hồi lại cho chúng tôi. Link reset chỉ có hiệu lược trong 15 phút.</p>
                <p>Cảm ơn bạn đã sử dụng WMovies</p>
                <p>WMovies Support</p>`,
          },
        ],
      });
      request
        .then((result) => {
          console.log(result.body);
          res.send({
            status: true,
            data: null,
            message: `Chúng tôi đã gửi đường dẫn reset mật khẩu cho tài khoản Email ${user.email} của bạn. Vui lòng kiểm tra hộp thư của bạn.`,
          });
        })
        .catch((err) => {
          console.log(err.statusCode);
          res.send({
            status: true,
            data: null,
            message:
              "Có lỗi xảy ra trong quá trình gửi mail, vui lòng kiểm tra lại địa chỉ Email của bạn",
          });
        });
    } else {
      res.send({
        status: false,
        data: null,
        message: "Email không tồn tại - Vui lòng kiểm tra lại email của mình",
      });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
const checkMailToken = async function (req, res) {
  if (
    req.body &&
    req.body.dataCheck &&
    req.body.dataCheck.email &&
    req.body.dataCheck.token
  ) {
    const body = {
      query: `
                      query MyQuery {
                          users(where:{ email: {_eq:"${req.body.dataCheck.email}"}, is_delete: {_eq: false} } ){
                              id
                              username
                              email
                             
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
      try {
        const claimToken = jwt.verify(
          req.body.dataCheck.token,
          process.env.JWT_SECRET_KEY
        );
        if (claimToken) {
          res.send({
            status: true,
            message: "Link reset hợp lệ",
            data: dataSend,
          });
        } else {
          return res.send({
            status: false,
            data: null,
            message:
              "Link reset mật khẩu đã hết hiệu lực. Vui lòng gửi lại yêu cầu cho chúng tôi",
          });
        }
      } catch (error) {
        return res.send({
          status: false,
          data: null,
          message:
            "Link reset mật khẩu đã hết hiệu lực. Vui lòng gửi lại yêu cầu cho chúng tôi",
        });
      }
    } else {
      res.send({
        status: false,
        data: null,
        message: "Email không tồn tại - Vui lòng kiểm tra lại email của mình",
      });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
const resetPassword = async function (req, res) {
  console.log(req.body);
  if (req.body && req.body.dataReset && req.body.dataReset.id) {
    // Đổi mật khẩu

    const saltRounds = 10;
    let hash = null;
    if (req.body.dataReset.password) {
      hash = bcrypt.hashSync(req.body.dataReset.password, saltRounds);
    }

    const bodyUpdate = {
      query: `
          mutation MyMutation {
              update_users(
                  where: {id: {_eq: "${req.body.dataReset.id}"}}
                  _set: {
  
                      password: "${hash}"
  
                  }) {
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
      blacklist.push(req.body.dataReset.token);
    } else {
      console.log(resUpdate.data.errors);
      res.send({
        status: false,
        data: null,
        message: "Cập nhật mật khẩu thất bại",
      });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
module.exports = {
  sendMailUser,
  checkMailToken,
  resetPassword,
};
