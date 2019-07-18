
const dateAsTimestamp = () => {
    return (+new Date).toString();
}

const userEmailParts = (email) => {
    return email.toLowerCase().split('@');
}

module.exports = {
    dateAsTimestamp: dateAsTimestamp,
    userEmailParts:userEmailParts
};