const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: 'dqm93zfod',
    api_key: '243362343343554',
    api_secret: 'TPdaUznbIT4gVb9mpR8ccbEal04'
});

function upload(file) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file, { resource_type: 'auto' }, (err, res) => {
            if (err) {
                console.log('cloudinary err:', err);
                reject(err);
            } else {
                resolve({
                    public_id: res.public_id,
                    secure_url: res.secure_url
                });
            }
        });
    });
}

function deleteImage(publicId) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (err, result) => {
            if (err) {
                console.log('cloudinary delete err:', err);
                reject(err);
            } else {
                console.log('cloudinary delete res:', result);
                resolve(result);
            }
        });
    });
}

module.exports = { upload, deleteImage };
