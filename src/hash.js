const bcrypt = require('bcryptjs');

module.exports = class Hash {
        
    /**
     * 
     * @param {*} str - string 
     */
    create(str){
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(str, salt);

        return {
            'salt': salt, 
            'hash': hash
        };
    }
    /**
     * 
     * @param {*} s - string 
     * @param {*} hash - hash as string
     * @returns boolean
     */
    compare(s,hash){
        return bcrypt.compareSync(s,hash);
    }
}