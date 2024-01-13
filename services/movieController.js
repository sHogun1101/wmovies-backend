const graphql = require("./graphQLSendRequest");
const insertMovie = async function (req, res) {
  if (req.body && req.body.data_insert) {
    const body = {
      query: `
                    mutation MyMutation($objects: [movies_insert_input!]!) {
                            insert_movies(
                              objects: $objects
                              ) {
                              affected_rows
                              returning {
                                  id
                              }
                            }
                    }
                          `,
      variables: { objects: req.body.data_insert },
    };
    const resInsert = await graphql.send(body);

    if (
      resInsert &&
      resInsert.data &&
      resInsert.data.data &&
      resInsert.data.data.insert_movies &&
      resInsert.data.data.insert_movies.returning &&
      resInsert.data.data.insert_movies.returning.length > 0
    ) {
      res.send({
        data: resInsert.data.data.insert_movies.returning,
        status: true,
      });
    } else {
      console.log(resInsert.data.errors);
      res.send({ status: false, data: "Thêm mới phim thất bại" });
    }
  } else {
    res.send({ status: false, data: "Không nhận được dữ liệu" });
  }
};
const updateMovie = async function (req, res) {
  if (req.body && req.body.data_update) {
    const variables = {};
    variables.content = req.body.data_update.content;
    variables.objects_1 = req.body.data_update.movie_images;
    if (req.body.data_update.movie_categories) {
      variables.objects_2 = req.body.data_update.movie_categories;
    }
    if (req.body.data_update.movie_actors) {
      variables.objects_3 = req.body.data_update.movie_actors;
    }
    if (req.body.data_update.movie_details) {
      variables.objects_4 = req.body.data_update.movie_details;
    }
    const body = {
      query: `
          mutation MyMutation(
              $content: String
              $objects_1: [movie_images_insert_input!]!
              ${
                req.body.data_update.movie_categories
                  ? ` $objects_2: [movie_categories_insert_input!]!`
                  : ""
              } 
              ${
                req.body.data_update.movie_actors
                  ? ` $objects_3: [movie_actors_insert_input!]!`
                  : ""
              } 
                ${
                  req.body.data_update.movie_details
                    ? ` $objects_4: [movie_details_insert_input!]!`
                    : ""
                } 
          
              ) {
              update_movies(
                  where: {id: {_eq: ${req.body.data_update.id}}}
                      _set: {
                          code: "${req.body.data_update.code}"
                          name: "${req.body.data_update.name}"
                          name_en: "${req.body.data_update.name_en}"
                          time: ${req.body.data_update.time}
                          year_of_manufacture: ${
                            req.body.data_update.year_of_manufacture
                          }
                          movie_type: "${req.body.data_update.movie_type}"
                          movie_status: "${req.body.data_update.movie_status}"
                          country_id: ${req.body.data_update.country_id}
                          total_episode:  ${
                            req.body.data_update.total_episode
                          }   
                          content: $content    
              }) {
                  affected_rows 
              }
  
              
              insert_movie_images(objects: $objects_1
                  on_conflict: {
                      constraint:  movie_images_movie_id_type_image_key
                      update_columns: [
                          url
                      ]    
                  }
              ){
                  affected_rows
                  returning {
                      id
                  }
              }
  
              ${
                req.body.data_update.movie_categories
                  ? `insert_movie_categories(objects: $objects_2){
                      affected_rows
                      returning {
                          id
                      }
                      }`
                  : ""
              }
                ${
                  req.body.data_update.movie_actors
                    ? `insert_movie_actors(objects: $objects_3){
                      affected_rows
                      returning {
                          id
                      }
                  }`
                    : ""
                }
                ${
                  req.body.data_update.movie_details
                    ? ` insert_movie_details(objects: $objects_4){
                      affected_rows
                      returning {
                          id
                      }
                  }`
                    : ""
                }
           }
                    `,
      variables: variables,
    };
    console.log(body);
    const resUpdate = await graphql.send(body);

    if (
      resUpdate &&
      resUpdate.data &&
      resUpdate.data.data &&
      resUpdate.data.data.update_movies &&
      resUpdate.data.data.update_movies.affected_rows
    ) {
      res.send({
        data: resUpdate.data.data.update_movies.affected_rows,
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
const getEpisodeMovie = async function (req, res) {
  const body = {
    query: `
        query MyQuery {
          movie_details(where: { movie: {code: {_eq: "${req.params.code}"} }, episode: {_eq: "${req.params.ep}"}}){
            id
            movie_id
            episode
            url_movie
            url_sub_en
            url_sub_vi
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
    resQuery.data.data.movie_details &&
    resQuery.data.data.movie_details.length > 0
  ) {
    res.send({
      data: resQuery.data.data.movie_details[0],
      status: true,
    });
  } else {
    console.log(resQuery.data.errors);
    res.send({ status: false, data: "Không tìm thấy tập phim" });
  }
  // } else {
  //   res.send({ status: false, data: "Không nhận được dữ liệu" });
  // }
};
const getTotalMovieFollowStatus = async function (req, res) {
  const body = {
    query: `
            query MyQuery {
              movies_aggregate(where: { movie_status: {_eq: "${req.params.status}"}}) {
                aggregate {
                  count
                }
              }
              movies(where: { movie_status: {_eq: "${req.params.status}"}}, limit: ${req.params.limit}, offset: ${req.params.offset} ){
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
                          `,
    variables: {},
  };
  const resQuery = await graphql.send(body);

  if (
    resQuery &&
    resQuery.data &&
    resQuery.data.data &&
    resQuery.data.data.movies &&
    resQuery.data.data.movies.length > 0
  ) {
    res.send({
      movies: resQuery.data.data.movies,
      movieTotal:
        resQuery.data.data.movies_aggregate &&
        resQuery.data.data.movies_aggregate.aggregate &&
        resQuery.data.data.movies_aggregate.aggregate.count
          ? resQuery.data.data.movies_aggregate.aggregate.count
          : null,
      status: true,
    });
  } else {
    console.log(resQuery.data.errors);
    res.send({ status: false, data: null });
  }
};
const getBXHViewMovieDayWeekMonth = async function (req, res) {
  const body = {
    query: `
    query MyQuery {
       movie_views_daily(where: {date: {_eq: "${req.params.date_now}"}}, limit: 15, order_by: {count_view: desc}){
          movie{
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
            movie_images {
              id
              type_image
              url
            }
          }
          count_view
        }
       movie_views_week(where: {fisrt_day_week: {_eq: "${req.params.first_day_week}"}, last_day_week: {_eq: "${req.params.last_day_week}"} }, limit: 15, order_by: {total_view: desc}){
          movie{
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
            movie_images {
              id
              type_image
              url
            }
          }
          total_view
        }
        movie_views_month(where: {fisrt_day_month: {_eq: "${req.params.first_day_month}"}, last_day_month: {_eq: "${req.params.last_day_month}"} }, limit: 15, order_by: {total_view: desc}){
          movie{
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
            movie_images {
              id
              type_image
              url
            }
          }
          total_view
        }
      
     }
                        `,
    variables: {},
  };
  const resQuery = await graphql.send(body);

  if (resQuery && resQuery.data && resQuery.data.data) {
    res.send({
      movie_views_daily: resQuery.data.data.movie_views_daily,
      movie_views_week: resQuery.data.data.movie_views_week,
      movie_views_month: resQuery.data.data.movie_views_month,
      status: true,
    });
  } else {
    console.log(resQuery.data.errors);
    res.send({ status: false, data: null });
  }
};
const getMovieFilterSearch = async function (req, res) {
  if (req.body && req.body) {
    const body = {
      query: `
        query MyQuery {
            movies_aggregate(${req.body.stringSearch}) {
              aggregate {
                count
              }
            }
            movies(${req.body.stringSearch}, limit: ${req.body.limit} , offset: ${req.body.offset} ${req.body.sort}){
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
        `,
      variables: {},
    };

    const resQuery = await graphql.send(body);

    if (
      resQuery &&
      resQuery.data &&
      resQuery.data.data &&
      resQuery.data.data.movies &&
      resQuery.data.data.movies.length > 0
    ) {
      res.send({
        dataMovies: resQuery.data.data.movies,
        dataTotal:
          resQuery.data.data.movies_aggregate &&
          resQuery.data.data.movies_aggregate.aggregate &&
          resQuery.data.data.movies_aggregate.aggregate.count
            ? resQuery.data.data.movies_aggregate.aggregate.count
            : null,
        status: true,
      });
    } else {
      console.log(resQuery.data.errors);
      res.send({ status: false, data: null });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
const getMovieTypeSearchInput = async function (req, res) {
  if (req.body && req.body) {
    const body = {
      query: `
        query MyQuery {
            movies(${req.body.textSearch}, limit: 7){
              id
              code
              name
              name_en
              content
              movie_images {
                id
                type_image
                url
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
      resQuery.data.data.movies &&
      resQuery.data.data.movies.length > 0
    ) {
      res.send({
        dataMovies: resQuery.data.data.movies,
        status: true,
      });
    } else {
      console.log(resQuery.data.errors);
      res.send({ status: false, data: null });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
const getMovieRecommended = async function (req, res) {
  if (req.body && req.body) {
    const body = {
      query: `
        query MyQuery {
            movies_aggregate(where: {${req.body.stringSearch}}) {
              aggregate {
                count
              }
            }
            movies(where: {${req.body.stringSearch}}, limit: ${req.body.limit} , offset: ${req.body.offset}){
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
        `,
      variables: {},
    };

    const resQuery = await graphql.send(body);

    if (
      resQuery &&
      resQuery.data &&
      resQuery.data.data &&
      resQuery.data.data.movies &&
      resQuery.data.data.movies.length > 0
    ) {
      res.send({
        dataMovies: resQuery.data.data.movies,
        dataTotal:
          resQuery.data.data.movies_aggregate &&
          resQuery.data.data.movies_aggregate.aggregate &&
          resQuery.data.data.movies_aggregate.aggregate.count
            ? resQuery.data.data.movies_aggregate.aggregate.count
            : null,
        status: true,
      });
    } else {
      console.log(resQuery.data.errors);
      res.send({ status: false, data: null });
    }
  } else {
    res.send({ status: false, data: null, message: "Không nhận được dữ liệu" });
  }
};
module.exports = {
  insertMovie,
  updateMovie,
  getEpisodeMovie,
  getTotalMovieFollowStatus,
  getBXHViewMovieDayWeekMonth,
  getMovieFilterSearch,
  getMovieRecommended,
  getMovieTypeSearchInput,
};
