export default function (err, _req, res, next) {
    res.status(500).json({msg: err.message})
}