const graphql = require("./graphQLSendRequest");
const insertCategory = async function (req, res) {
  if (req.body && req.body.data_insert) {
    const object = {};
    object.code = req.body.data_insert.code;
    object.name = req.body.data_insert.name;
    //   object.created_by = eq.body.data_insert.created_by ;
    const body = {
      query: `
              mutation MyMutation($objects: [categories_insert_input!]!) {
                      insert_categories(
                        objects: $objects
                        ) {
                        affected_rows
                        returning {
                            id
                            code
                            name
                            
                          
                        }
                      }
              }
                    `,
      variables: { objects: object },
    };
    const resInsert = await graphql.send(body);

    if (
      resInsert &&
      resInsert.data &&
      resInsert.data.data &&
      resInsert.data.data.insert_categories &&
      resInsert.data.data.insert_categories.returning &&
      resInsert.data.data.insert_categories.returning.length > 0
    ) {
      res.send({
        data: resInsert.data.data.insert_categories.returning,
        status: true,
      });
    } else {
      console.log(resInsert.data.errors);
      res.send({ status: false, data: "Thêm thể loại thất bại" });
    }
  } else {
    res.send({ status: false, data: "Không nhận được dữ liệu" });
  }
};
const updateCategory = async function (req, res) {
  if (req.body && req.body.data_update) {
    const body = {
      query: `
              mutation MyMutation {
                  update_categories(
                      where: {id: {_eq: ${req.body.data_update.id}}}
                      _set: {
                            code: "${req.body.data_update.code}"
                            name: "${req.body.data_update.name}"
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
      resUpdate.data.data.update_categories &&
      resUpdate.data.data.update_categories.affected_rows
    ) {
      res.send({
        data: resUpdate.data.data.update_categories.affected_rows,
        status: true,
      });
    } else {
      console.log(resUpdate.data.errors);
      res.send({ status: false, data: "Cập nhật thể loại thất bại" });
    }
  } else {
    res.send({ status: false, data: "Không nhận được dữ liệu" });
  }
};
module.exports = {
  insertCategory,
  updateCategory,
};
