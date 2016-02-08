/**
 * GET /users/{id}
 */
module.exports.get = function *(next) {
    this.status = 200;
    this.body = {
        id: this.params.id
    }
};

/**
 * POST /users {name}
 */
module.exports.post = function *(next) {
    try {
        this.status = 201;
        this.body = {
            created: this.request.body
        };
    } catch (e) {
        this.status = 500;
        this.body = e;
    }
};
