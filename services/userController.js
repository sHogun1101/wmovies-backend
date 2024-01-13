require("dotenv").config();
const graphql = require("./graphQLSendRequest");
const bcrypt = require("bcrypt");
const insertUser = async function (req, res) {
  if (req.body && req.body.data_insert) {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const myPlaintextPassword = req.body.data_insert.password;
    const hash = bcrypt.hashSync(myPlaintextPassword, salt);
    const object = {};
    object.username = req.body.data_insert.username;
    object.email = req.body.data_insert.email;
    object.password = hash;
    const body = {
      query: `
              mutation MyMutation($objects: [users_insert_input!]!) {
                      insert_users(
                        objects: $objects
                        ) {
                        affected_rows
                        returning {
                            id
                            username
                            email
                            is_delete
                          
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
      resInsert.data.data.insert_users &&
      resInsert.data.data.insert_users.returning &&
      resInsert.data.data.insert_users.returning.length > 0
    ) {
      res.send({
        data: resInsert.data.data.insert_users.returning,
        status: true,
      });
    } else {
      console.log(resInsert.data.errors);
      res.send({ status: false, data: "Thêm tài khoản thất bại" });
    }
  } else {
    res.send({ status: false, data: "Không nhận được dữ liệu" });
  }
};
const updateUser = async function (req, res) {
  if (req.body && req.body.data_update) {
    const saltRounds = 10;
    let hash = null;
    if (req.body.data_update.password) {
      hash = bcrypt.hashSync(req.body.data_update.password, saltRounds);
    }
    const body = {
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
        data: resUpdate.data.data.update_users.affected_rows,
        status: true,
      });
    } else {
      console.log(resUpdate.data.errors);
      res.send({ status: false, data: "Cập nhật tài khoản thất bại" });
    }
  } else {
    res.send({ status: false, data: "Không nhận được dữ liệu" });
  }
};
const getMovieHistory = async function (req, res) {
  const body = {
    query: `
        query MyQuery {
          movie_history_aggregate(where: {user_id: {_eq: "${req.params.user_id}"}, is_delete: {_eq: false}}) {
            aggregate {
              count
            }
          }
          movie_history(where: {user_id: {_eq: "${req.params.user_id}"}, is_delete: {_eq: false} }, limit:${req.params.limit} , offset: ${req.params.offset}, order_by: {created_at: desc}){
            id
            movie_id
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
            user_id
            is_delete
            episode
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
    resQuery.data.data.movie_history &&
    resQuery.data.data.movie_history.length > 0
  ) {
    res.send({
      dataHistory: resQuery.data.data.movie_history,
      dataTotal:
        resQuery.data.data.movie_history_aggregate &&
        resQuery.data.data.movie_history_aggregate.aggregate &&
        resQuery.data.data.movie_history_aggregate.aggregate.count
          ? resQuery.data.data.movie_history_aggregate.aggregate.count
          : null,
      status: true,
    });
  } else {
    console.log(resQuery.data.errors);
    res.send({ status: false, data: null });
  }
};
const getMovieFavourite = async function (req, res) {
  const body = {
    query: `
        query MyQuery {
          movie_favourite_aggregate(where: {user_id: {_eq: "${req.params.user_id}"}, is_delete: {_eq: false}}) {
            aggregate {
              count
            }
          }
          movie_favourite(where: {user_id: {_eq: "${req.params.user_id}"}, is_delete: {_eq: false} }, limit:${req.params.limit} , offset: ${req.params.offset}, order_by: {created_at: desc}){
            id
            movie_id
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
            user_id
            is_delete
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
    resQuery.data.data.movie_favourite &&
    resQuery.data.data.movie_favourite.length > 0
  ) {
    res.send({
      dataFavourite: resQuery.data.data.movie_favourite,
      dataTotal:
        resQuery.data.data.movie_favourite_aggregate &&
        resQuery.data.data.movie_favourite_aggregate.aggregate &&
        resQuery.data.data.movie_favourite_aggregate.aggregate.count
          ? resQuery.data.data.movie_favourite_aggregate.aggregate.count
          : null,
      status: true,
    });
  } else {
    console.log(resQuery.data.errors);
    res.send({ status: false, data: null });
  }
};
const getWordsUser = async function (req, res) {
  const body = {
    query: `
        query MyQuery {
          movie_words_aggregate(where: {user_id: {_eq: "${req.params.user_id}"}, is_delete: {_eq: false}}) {
            aggregate {
              count
            }
          }
          movie_words(where: {user_id: {_eq: "${req.params.user_id}"}, is_delete: {_eq: false} }, limit:${req.params.limit} , offset: ${req.params.offset}, order_by: {created_at: desc}){
            id
            movie_id
            movie {
              id
              code
              name
              name_en
            }
            word_id
            word {
              id
              word
              pronunciation
              type
              meaning
              example
            }
            user_id
            is_delete
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
    resQuery.data.data.movie_words &&
    resQuery.data.data.movie_words.length > 0
  ) {
    res.send({
      dataWords: resQuery.data.data.movie_words,
      dataTotal:
        resQuery.data.data.movie_words_aggregate &&
        resQuery.data.data.movie_words_aggregate.aggregate &&
        resQuery.data.data.movie_words_aggregate.aggregate.count
          ? resQuery.data.data.movie_words_aggregate.aggregate.count
          : null,
      status: true,
    });
  } else {
    console.log(resQuery.data.errors);
    res.send({ status: false, data: null });
  }
};
const getCoupletsUser = async function (req, res) {
  const body = {
    query: `
        query MyQuery {
          movie_couplets_aggregate(where: {user_id: {_eq: "${req.params.user_id}"}, is_delete: {_eq: false}}) {
            aggregate {
              count
            }
          }
          movie_couplets(where: {user_id: {_eq: "${req.params.user_id}"}, is_delete: {_eq: false} }, limit:${req.params.limit} , offset: ${req.params.offset}, order_by: {created_at: desc}){
            id
            movie_id
            movie {
              id
              code
              name
              name_en
            }
            couplet
            meaning
            user_id
            is_delete
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
    resQuery.data.data.movie_couplets &&
    resQuery.data.data.movie_couplets.length > 0
  ) {
    res.send({
      dataCouplets: resQuery.data.data.movie_couplets,
      dataTotal:
        resQuery.data.data.movie_couplets_aggregate &&
        resQuery.data.data.movie_couplets_aggregate.aggregate &&
        resQuery.data.data.movie_couplets_aggregate.aggregate.count
          ? resQuery.data.data.movie_couplets_aggregate.aggregate.count
          : null,
      status: true,
    });
  } else {
    console.log(resQuery.data.errors);
    res.send({ status: false, data: null });
  }
};
const getWordsUserFollowMovie = async function (req, res) {
  const body = {
    query: `
        query MyQuery {
          movie_words_aggregate(where: {user_id: {_eq: "${req.params.user_id}"},movie: {code: {_eq: "${req.params.code_movie}"}}, is_delete: {_eq: false}}) {
            aggregate {
              count
            }
          }
          movies(where: {code: {_eq: "${req.params.code_movie}"}}){
            id
            code
            name
            name_en
            content
            movie_images(where: {type_image: {_eq: "image"}}) {
              id
              type_image
              url
            }
          }
          movie_words(where: {user_id: {_eq: "${req.params.user_id}"}, movie: {code: {_eq: "${req.params.code_movie}"}}, is_delete: {_eq: false} }, limit:${req.params.limit} , offset: ${req.params.offset}, order_by: {created_at: desc}){
            id
            movie_id
            movie {
              id
              code
              name
              name_en
            }
            word_id
            word {
              id
              word
              pronunciation
              type
              meaning
              example
            }
            user_id
            is_delete
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
    resQuery.data.data.movie_words &&
    resQuery.data.data.movie_words.length > 0
  ) {
    res.send({
      dataMovie: resQuery.data.data.movies[0],
      dataWords: resQuery.data.data.movie_words,
      dataTotal:
        resQuery.data.data.movie_words_aggregate &&
        resQuery.data.data.movie_words_aggregate.aggregate &&
        resQuery.data.data.movie_words_aggregate.aggregate.count
          ? resQuery.data.data.movie_words_aggregate.aggregate.count
          : null,
      status: true,
    });
  } else {
    console.log(resQuery.data.errors);
    res.send({ status: false, dataMovie: resQuery.data.data.movies[0] });
  }
};
const getCoupletsUserFollowMovie = async function (req, res) {
  const body = {
    query: `
        query MyQuery {
          movie_couplets_aggregate(where: {user_id: {_eq: "${req.params.user_id}"},movie: {code: {_eq: "${req.params.code_movie}"}}, is_delete: {_eq: false}}) {
            aggregate {
              count
            }
          }
          movies(where: {code: {_eq: "${req.params.code_movie}"}}){
            id
            code
            name
            name_en
            content
            movie_images(where: {type_image: {_eq: "image"}}) {
              id
              type_image
              url
            }
          }
          movie_couplets(where: {user_id: {_eq: "${req.params.user_id}"}, movie: {code: {_eq: "${req.params.code_movie}"}}, is_delete: {_eq: false} }, limit:${req.params.limit} , offset: ${req.params.offset}, order_by: {created_at: desc}){
            id
            movie_id
            movie {
              id
              code
              name
              name_en
            }
            couplet
            meaning
            user_id
            is_delete
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
    resQuery.data.data.movie_couplets &&
    resQuery.data.data.movie_couplets.length > 0
  ) {
    res.send({
      dataMovie: resQuery.data.data.movies[0],
      dataCouplets: resQuery.data.data.movie_couplets,
      dataTotal:
        resQuery.data.data.movie_couplets_aggregate &&
        resQuery.data.data.movie_couplets_aggregate.aggregate &&
        resQuery.data.data.movie_couplets_aggregate.aggregate.count
          ? resQuery.data.data.movie_couplets_aggregate.aggregate.count
          : null,
      status: true,
    });
  } else {
    console.log(resQuery.data.errors);
    res.send({ status: false, dataMovie: resQuery.data.data.movies[0] });
  }
};
const updateMovieHistory = async function (req, res) {
  if (req.body && req.body.itemSend) {
    const dataSend = req.body.itemSend;
    const objects = {};
    // Thêm vào lịch sử xem phim
    if (dataSend.user_id) {
      objects.user_id = dataSend.user_id;
      objects.movie_id = dataSend.movie_id;
      objects.episode = dataSend.episode;
      objects.is_delete = false;
    }
    // Thêm logs phim
    const objects2 = {};
    objects2.date = dataSend.date;
    objects2.movie_id = dataSend.movie_id;
    if (dataSend.count_view) {
      objects2.count_view = dataSend.count_view + 1;
    } else {
      objects2.count_view = 1;
    }
    // Cập nhật số lượt xem phim
    const queryUpdateMovie = `
                update_movies(
                  where: {id: {_eq: ${dataSend.movie_id} }},
                  _inc: {view: 1}
                  ) {
                  affected_rows       
          }
        `;
    const variables = {};
    if (dataSend.user_id) {
      variables.objects = objects;
    }
    variables.objects_2 = objects2;
    const body = {
      query: `
                    mutation MyMutation(
                     ${
                       dataSend.user_id
                         ? ` $objects: [movie_history_insert_input!]!`
                         : ""
                     }
                      $objects_2: [movie_logs_insert_input!]!
                    ) {
                      ${
                        dataSend.user_id
                          ? `insert_movie_history(objects: $objects
                            on_conflict: {
                                constraint:  movie_history_movie_id_user_id_episode_key
                                update_columns: [
                                    is_delete
                                ]    
                            }
                        ){
                            affected_rows
                        }`
                          : ""
                      }
                      insert_movie_logs(objects: $objects_2
                        on_conflict: {
                            constraint:  movie_logs_movie_id_date_key
                            update_columns: [
                                count_view
                            ]    
                        }
                      ){
                          affected_rows
                      }
                        ${queryUpdateMovie}
                    }
                          `,
      variables: variables,
    };
    const resInsert = await graphql.send(body);
  } else {
    console.log(req.body);
  }
};
module.exports = {
  insertUser,
  updateUser,
  getMovieHistory,
  getMovieFavourite,
  getWordsUser,
  getWordsUserFollowMovie,
  getCoupletsUser,
  getCoupletsUserFollowMovie,
  updateMovieHistory,
};
