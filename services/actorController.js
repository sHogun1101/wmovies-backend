const graphql = require("./graphQLSendRequest");
const insertActor = async function (req, res) {
  if (req.body && req.body.data_insert) {
    const object = {};
    object.code = req.body.data_insert.code;
    object.name = req.body.data_insert.name;
    object.introduce = req.body.data_insert.introduce;
    if (req.body.data_insert.image_actor) {
      object.image_actor = req.body.data_insert.image_actor;
    }
    //   object.created_by = eq.body.data_insert.created_by ;
    const body = {
      query: `
                  mutation MyMutation($objects: [actors_insert_input!]!) {
                          insert_actors(
                            objects: $objects
                            ) {
                            affected_rows
                            returning {
                                id
                                code
                                name
                                introduce
                                image_actor
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
      resInsert.data.data.insert_actors &&
      resInsert.data.data.insert_actors.returning &&
      resInsert.data.data.insert_actors.returning.length > 0
    ) {
      res.send({
        data: resInsert.data.data.insert_actors.returning,
        status: true,
      });
    } else {
      console.log(resInsert.data.errors);
      res.send({ status: false, data: "Thêm diễn viên thất bại" });
    }
  } else {
    res.send({ status: false, data: "Không nhận được dữ liệu" });
  }
};
const updateActor = async function (req, res) {
  if (req.body && req.body.data_update) {
    const body = {
      query: `
                  mutation MyMutation($introduce: String) {
                      update_actors(
                          where: {id: {_eq: ${req.body.data_update.id}}}
                          _set: {
                                code: "${req.body.data_update.code}"
                                name: "${req.body.data_update.name}"
                                introduce: $introduce
                               ${
                                 req.body.data_update.image_actor
                                   ? `image_actor: "${req.body.data_update.image_actor}"`
                                   : ""
                               }
                          }
                      ) {
                          affected_rows 
                      }
                  }
                  `,
      variables: { introduce: req.body.data_update.introduce },
    };
    const resUpdate = await graphql.send(body);

    if (
      resUpdate &&
      resUpdate.data &&
      resUpdate.data.data &&
      resUpdate.data.data.update_actors &&
      resUpdate.data.data.update_actors.affected_rows
    ) {
      res.send({
        data: resUpdate.data.data.update_actors.affected_rows,
        status: true,
      });
    } else {
      console.log(resUpdate.data.errors);
      res.send({ status: false, data: "Cập nhật diễn viên thất bại" });
    }
  } else {
    res.send({ status: false, data: "Không nhận được dữ liệu" });
  }
};
const getActor = async function (req, res) {
  const body = {
    query: `
      query MyQuery {
        actors(where: {code: {_eq: "${req.params.actor_code}"}}){
            id
            code
            name
            introduce
            birthday
            image_actor
            movie_actors(where: {is_delete: {_eq: false}}){
              movie {
                id
                code
                name
                name_en
                movie_status
                movie_type
                content
                time
                view
                year_of_manufacture
                total_episode
                country_id
                country {
                  id
                  code
                  name
                }
                movie_images {
                  id
                  type_image
                  url
                }
                movie_categories(where: {is_delete: {_eq: false}}){
                  id
                  movie_id
                  category_id
                  category {
                    id
                    code
                    name
                  }
                }
                movie_actors(where: {is_delete: {_eq: false}}){
                  id
                  movie_id
                  actor_id
                  actor {
                    id
                    code
                    name
                  }
                }
                movie_details(where: {is_delete: {_eq: false}}){
                  id
                  movie_id
                  episode
                  url_movie
                  url_sub_en
                  url_sub_vi
                }
              }
            }
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
    resQuery.data.data.actors &&
    resQuery.data.data.actors.length > 0
  ) {
    res.send({
      actor: resQuery.data.data.actors,
      status: true,
    });
  } else {
    console.log(resQuery.data.errors);
    res.send({ status: false, data: null });
  }
};
module.exports = {
  insertActor,
  updateActor,
  getActor,
};
