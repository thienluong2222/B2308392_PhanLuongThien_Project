const express = require('express');
const cors = require('cors');
const ApiError = require('./app/api-error');
const nhaxuatbanRoute = require('./app/routes/nhaxuatban.route');
const sachRoute = require('./app/routes/sach.route');
const docgiaRoute = require('./app/routes/docgia.route');
const nhanvienRoute = require('./app/routes/nhanvien.route')
const theodoiRoute = require('./app/routes/theodoimuonsach.route')


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to ehehehe' })
});

app.use('/api/nhaxuatban', nhaxuatbanRoute);
app.use('/api/sach', sachRoute);
app.use('/api/docgia', docgiaRoute)
app.use('/api/nhanvien', nhanvienRoute);
app.use('/api/theodoimuonsach', theodoiRoute);

app.use((req, res, next) => {
    return next(new ApiError(404, 'Resource not found'))
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;