const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 8000;
const DB_URL = isProduction ? 'mongodb://cmpt470.dpsi.jp:27017' : 'mongodb://localhost:27017';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;    // 10 MB

export {isProduction, port, DB_URL, MAX_IMAGE_SIZE};