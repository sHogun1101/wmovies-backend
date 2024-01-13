const graphql = require("./graphQLSendRequest");
const insertCountry = async function (req, res) {
  if (req.body && req.body.data_insert) {
    const object = {};
    object.code = req.body.data_insert.code;
    object.name = req.body.data_insert.name;
    object.name_en = req.body.data_insert.name_en;
    //   object.created_by = eq.body.data_insert.created_by ;
    const body = {
      query: `
                mutation MyMutation($objects: [countries_insert_input!]!) {
                        insert_countries(
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
      resInsert.data.data.insert_countries &&
      resInsert.data.data.insert_countries.returning &&
      resInsert.data.data.insert_countries.returning.length > 0
    ) {
      res.send({
        data: resInsert.data.data.insert_countries.returning,
        status: true,
      });
    } else {
      console.log(resInsert.data.errors);
      res.send({ status: false, data: "Thêm nơi SX thất bại" });
    }
  } else {
    res.send({ status: false, data: "Không nhận được dữ liệu" });
  }
};
const updateCountry = async function (req, res) {
  if (req.body && req.body.data_update) {
    const body = {
      query: `
                mutation MyMutation {
                    update_countries(
                        where: {id: {_eq: ${req.body.data_update.id}}}
                        _set: {
                              code: "${req.body.data_update.code}"
                              name: "${req.body.data_update.name}"
                              name_en: "${req.body.data_update.name_en}"
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
      resUpdate.data.data.update_countries &&
      resUpdate.data.data.update_countries.affected_rows
    ) {
      res.send({
        data: resUpdate.data.data.update_countries.affected_rows,
        status: true,
      });
    } else {
      console.log(resUpdate.data.errors);
      res.send({ status: false, data: "Cập nhật nơi SX thất bại" });
    }
  } else {
    res.send({ status: false, data: "Không nhận được dữ liệu" });
  }
};
module.exports = {
  insertCountry,
  updateCountry,
};
