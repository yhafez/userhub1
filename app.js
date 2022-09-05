/* -------------------------------------------------------------------------------------------------- Functions ------------------------------------------------------------------------------------------------- */



/*------------------------------User List------------------------------*/


const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';


function fetchData(url) {

    return fetch(url)
    .then(result => result.json())
    .catch(error => console.error(`
    Oh no! There's an error fetching data.
    Error: ${error}`));

}


function fetchUsers () {

    return fetchData(BASE_URL + '/users');

}


function renderUser(user) {
    
    let {name, username, email, company} = user;
    let {name: compName, catchPhrase, bs} = company; 

    const newUser = $(`
    <div class="user-card">
    <header>
        <h2>${name}</h2>
    </header>
    <section class="company-info">
        <p><b>Contact:</b> ${email}</p>
        <p><b>Works for:</b> ${compName}</p>
        <p><b>Company creed:</b> "${catchPhrase}, which will ${bs}!"</p>
    </section>
    <footer>
        <button class="load-posts">POSTS BY ${username}</button>
        <button class="load-albums">ALBUMS BY ${username}</button>
    </footer>
    </div>`)

    newUser.data('user', user);
    return newUser;

}


function renderUserList(userList) {

    $('#user-list').empty();
    for (let item of userList) {$('#user-list').append(renderUser(item));}

}


function bootstrap () {

    fetchUsers().then(renderUserList)
    .catch(error => console.error(`
    Oh no! There was an error rendering the user list.
    Error: ${error}`));

}


/*------------------------------Album List------------------------------*/


function fetchUserAlbumList(userId) {

    return fetchData(BASE_URL + '/users/' + userId + '/albums?_expand=user&_embed=photos');

}


function renderAlbum(album) {

    const {title, user, photos} = album;
    const {name, username} = user;

    const newAlbum = $(`
    <div class="album-card">
    <header>
        <h3>${title}, by ${username} </h3>
    </header>
    <section class="photo-list" id="#${username}">
    </section>
    </div>
    `)

    return newAlbum;

}


function renderPhoto(photo) {

    const {title, url, thumbnailUrl: thumbnail} = photo;

    return $(`
    <div class="photo-card">
        <a href="${url}" target="_blank">
            <img src="${thumbnail}">
            <figure>${title}</figure>
        </a>
    </div>
    `);

}


function renderAlbumList(albumList) {

    $('#app section.active').removeClass('active');
    $('#album-list').addClass('active').empty();

    for (let album of albumList) {
        const {photos, user} = album;
        const {username} = user;

        $('#album-list').append(renderAlbum(album));

        for (let photo of photos) {

            const photoCard = renderPhoto(photo);
            $('.photo-list').append(photoCard);
            
        }
    }

}


/*------------------------------Posts and Comments------------------------------*/


function fetchUserPosts(userId) {
    return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
  }
  

  function fetchPostComments(postId) {
    return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);
  }


  function setCommentsOnPost(post) {

    if (post.comments) {return Promise.reject(null);}

    return fetchPostComments(post.id)
    .then ((comments) => {
        post.comments = comments;
        return post;
    })
    .catch ((error) => console.error(`
    Oh no! There was an error fetching the post comments.
    Error: ${error}`));

  }


function renderPost(post) {

    let {title, body, user} = post;
    let {username} = user;
    
    const postTemplate = $(`
    <div class="post-card">
        <header>
            <h3>${title}</h3>
            <h3> --- ${username}</h3>
        </header>
        <p>${body}</p>
        <footer>
        <div class="comment-list"></div>
        <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
        </footer>
    </div>
    `)

    postTemplate.data('post', post);
    return postTemplate;

}


function renderPostList(postList) {

    $('#app section.active').removeClass('active');
    $('#post-list').addClass('active').empty();

    for (let post of postList) {

        $('#post-list').append(renderPost(post));

    }

}


function toggleComments(postCardElement) {
    
    const footerElement = postCardElement.find('footer');
  
    if (footerElement.hasClass('comments-open')) {

      footerElement.removeClass('comments-open');
      footerElement.find('.verb').text('show');

    } else {

      footerElement.addClass('comments-open');
      footerElement.find('.verb').text('hide');
    
    }

}


/* ------------------------------------------------------------------------------------------------ Click Handlers ----------------------------------------------------------------------------------------------- */



$('#user-list').on('click', '.user-card .load-posts', function () {

    let selectedUser = $(this).closest('div').data('user');
    fetchUserPosts(selectedUser.id).then(renderPostList)

});
  

$('#user-list').on('click', '.user-card .load-albums', function () {

    let selectedUser = $(this).closest('div').data('user');
    fetchUserAlbumList(selectedUser.id).then(renderAlbumList)
    .catch(error => console.error(`
    Uh oh! There's an error with the album click-handler
    Error: ${error}`));

});


$('#post-list').on('click', '.post-card .toggle-comments', function () {
    const postCardElement = $(this).closest('.post-card');
    const post = postCardElement.data('post');
  
    setCommentsOnPost(post).then(function (post) {
        
        const commentList = postCardElement.find('.comment-list');
        $(commentList).empty();
        
        for (let comment of post.comments) {
            
            const newComment = $(`
            <h3>${comment.body}</h3>
            <h3>${comment.email}</h3>
            `)
            
            $(commentList).append(newComment);
        }

      }).then(() => toggleComments(postCardElement))
      .catch(function () {
        toggleComments(postCardElement);
    });

  });


/* ------------------------------------------------------------------------------------------------- Runtime Code ------------------------------------------------------------------------------------------------ */



$(document).ready(bootstrap);