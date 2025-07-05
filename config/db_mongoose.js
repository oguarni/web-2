const StringCon = {
    connection: process.env.MONGODB_URI || "mongodb://localhost:27017/reservas_db"
}
module.exports = StringCon;