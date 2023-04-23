const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({ ok: false, message });
}

const successResponse = (res, statusCode, message, data) => {
    return res.status(statusCode).json({ ok: true, message, data });
}

export { successResponse, errorResponse };