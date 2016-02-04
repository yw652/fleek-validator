/**
 * POST /users {name}
 */
module.exports.post = function *(next) {
    try {
        console.log(this.request.body + ' created');
        this.status = 201;
    } catch (e) {
        this.status = 500;
        this.response.body = e;
    }
};



